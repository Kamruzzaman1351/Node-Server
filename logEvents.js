const fs = require("fs")
const fsPromises = require("fs").promises
const path = require("path")
const {v4:uuid} = require("uuid")
const {format} = require("date-fns")



const logEvents = async(msg, fileName) => {
    const date = format(new Date(), "yyyy-MM-dd\thh:mm:ss")
    const logId = uuid()
    const logText = `${date} Id:${logId}  ${msg? msg : "No Message"} \n`
    try {
        if(!fs.existsSync(path.join(__dirname, "logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "logs"))
        }
        await fsPromises.appendFile(path.join(__dirname, "logs", fileName), logText)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {logEvents}