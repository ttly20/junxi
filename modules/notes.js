const mongoose = require("mongoose")
mongoose.set('useCreateIndex', true)

const notesSchema = new mongoose.Schema({
    title: { type: String, unique: true },
    author: { type: String },
    content: { type: String },
    date: { type: Date, default: Date.now},
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "tags" }],
    directory: { type: mongoose.Schema.Types.ObjectId, ref: "dirs" }
})

const directorySchema = new mongoose.Schema({
    directory: { type: String, unique: true },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "notes" }]
})

const tagsSchema = new mongoose.Schema({
    tag: { type: String, unique: true },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "notes" }]
})

module.exports = {
    tags: mongoose.model("tags", tagsSchema),
    dirs: mongoose.model("dirs", directorySchema),
    notes: mongoose.model("notes", notesSchema),
}