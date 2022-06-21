const {logEvents} = require("./logEvents")
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

myEmitter.on("event", (msg, fileName) => {
    logEvents(msg, fileName)
})

myEmitter.emit("event", "Test Event Log Function", __filename)

