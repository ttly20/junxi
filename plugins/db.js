module.exports = (app, database)=> {
    const mongoose = require("mongoose")
    mongoose.connect(database, {
        useNewUrlParser: true
    })
}