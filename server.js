const http = require("http")
const path = require("path")
const fs = require("fs")
const fsPromises = require("fs").promises
const {logEvents} = require("./logEvents")
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

myEmitter.on("log", (msg, fileName) => logEvents(msg, fileName))

// myEmitter.emit("log", "Test Event Log Function", __filename)
const PORT = process.env.PORT || 8000

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(
            filePath, 
            !contentType.includes("image") ? "utf8" : ""
        )
        const data = contentType === "application/json" ? JSON.parse(rawData) : rawData
        response.writeHead(
            filePath.includes("404.html") ? 404 : 200, 
            {"Content-Type": contentType}
        )
        response.end(
            contentType === "application/json" ? JSON.stringify(data) : data
        )
        
    } catch (error) {
        console.log(error)
        myEmitter.emit("log", `Error Name: ${error.name} \t Error: ${error.message}`, "errLog.txt")
        response.statusCode = 500
        response.end()
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method)
    myEmitter.emit("log", `Request Url: ${req.url} \t Request Method: ${req.method}`, "reqLog.txt")
    const extension = path.extname(req.url)
    let contentType
    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }
    let filePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'pages', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'pages', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'pages', req.url)
                    : path.join(__dirname, req.url);
    
    if(!extension && req.url.slice(-1) !== '/') {
        filePath += '.html'
    }
    const fileExists = fs.existsSync(filePath)
    if(fileExists) {
        // Serve the file
        serveFile(filePath, contentType, res)
    } else {
        // 404 or 301
        switch(path.parse(filePath).base) {
            case "old-page.html":
                res.writeHead(301, {"Location": "/new-page.html"})
                res.end()
                break
            case "www-page.html":
                res.writeHead(301, {"Location": "/"})
                res.end()
                break
            default:
                serveFile(path.join(__dirname, "pages", "404.html"), "text/html", res)
        }
    }
})

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})
