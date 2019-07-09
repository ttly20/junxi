const mongoose = require("mongoose")

const tags = new mongoose.Schema({
    lable: { type: String },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "notes" }]
})

module.exports = mongoose.model("tags", tags)