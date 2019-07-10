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

// set 404
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

// set 500
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// listen 3000
app.listen(3000, () => {
    console.log("The App running 3000 port\n" +
                "please open: localhost:3000")
})