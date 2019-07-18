const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    uesrname: { type: String, unique: true, required: true },
    password: { type: String, unique: true},
    nickname: { type: String, unique: true},
})

module.exports = mongoose.model("user", userSchema)