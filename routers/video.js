module.exports = app => {
    const express = require("express")
    const router = express.Router({
        mergeParams: true
    })

    const VIDEOS = require("../modules/video").videos

    // video list
    router.get("/list",async (req, res) => {
        let list = await VIDEOS.find().exec()
        res.send(list)
    })

    app.use("/api/video", router)
}