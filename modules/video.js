const mongoose = require("mongoose")
mongoose.set('useCreateIndex', true)

const VideoSchema = new mongoose.Schema({
    poster: { type: String },
    title: { type: String },
    alias: { type: String },
    director: { type: String },
    actor: { type: String },
    type: { type: String },
    area: { type: String },
    language: { type: String },
    released: { type: String },
    update: { type: String },
    plot: { type: String },
    plays: { type: mongoose.Schema.Types.Mixed  },
    download: { type: mongoose.Schema.Types.Mixed },
})

module.exports = {
    videos: mongoose.model("videos", VideoSchema),
}