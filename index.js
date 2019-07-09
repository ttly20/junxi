// create App
const express = require("express")
const app = express()

// static folder
app.use(express.static(__dirname + "/static"))


// set template engine
const pug = require("pug")
app.set("view engine", "pug")
app.set("views", __dirname + "/views")

// router
const bodyParse = require("body-parser")
app.use(bodyParse.json({ strict: true }))
app.use(bodyParse.urlencoded({ extended: true }))
app.use(require("cors")())
require(__dirname + "/routers")(app)

// database
require(__dirname + "/plugins/db")(app, "mongodb://127.0.0.1:27017/ttly20")

// listen 3000
app.listen(3000, () => {
    console.log("The App running 3000 port\n" +
                "please open: localhost:3000")
})