const mongoose = require("mongoose")

const directory = new mongoose.Schema({
    directory: { type: String },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "notes" }]
})

module.exports = mongoose.model("directory", directory)