module.exports = app => {
    const EXPRESS = require("express")
    const ROUTER = EXPRESS.Router({
        mergeParams: true
    })

    const VIDEOS = require("../modules/video").videos

    // aggregate
    async function aggregate (option) {
        let aggregate = await VIDEOS.aggregate().group({ _id: option }).exec()
        return aggregate
    }

    // video list
    ROUTER.get("/list/:page",async (req, res) => {
        let list
        if (req.params.page > 500) res.status(204)
            .send({ message: "Sorry!No more content!" })
        if (req.params.page == 1)
            list = await VIDEOS.find()
                .limit(10).sort({ update: -1 }).exec()
        else
            list = await  VIDEOS.find().skip((req.params.page - 1) * 10)
                .limit(10).sort({ update: -1 }).exec()
        console.log(list[0])
        res.send(list)
    })

    // video sort
    ROUTER.get("/sort/", async (req, res) => {
        let list = await aggregate("$type")
        if (list.length == 0) return res.status(204)
            .send({ message: "Sorry!No classification!" })
        res.send(list)
    })

    // video sort query
    ROUTER.get("/sort/:type/:page", async (req, res) => {
        let list
        if (req.params.page > 500) res.status(204)
            .send({ message: "Sorry!No " + req.params.type + " content found!" })
        if (req.params.page == 1)
            list = await VIDEOS.find({ type: req.params.type })
                .sort({ update: -1 }).limit(10).exec()
        else
            list = await VIDEOS.find({ type: req.params.type })
                .skip((req.params.page - 1) * 10).sort({ update: -1 }).limit(10).exec()
        res.send(list)
    })

    // video actor
    ROUTER.get("/actor/", async (req, res) => {
        let list = await aggregate("$actor")
        if (list.length == 0) return res.status(204)
            .send({ message: "Sorry!No actors!" })
        res.send(list)
    })

    // video actor query
    ROUTER.get("/actor/:actor/:page", async (req, res) => {
        let list
        if (req.params.page > 500) res.status(204)
            .send({ message: "Sorry!Did not find " +  req.params.actor + " content!" })
        if (req.params.page == 1)
            list = await VIDEOS.find({ actor: req.params.actor })
                .skip(req.params.page).sort({ update: -1 }).limit(10).exec()
        else
            list = await VIDEOS.find({ actor: req.params.actor })
                .skip((req.params.page - 1) * 10).sort({ update: -1 }).limit(10).exec()
        res.send(list)
    })

    // video language
    ROUTER.get("/language/", async (req, res) => {
        let list = await aggregate("$language")
        if (list.length == 0) return res.status(204)
            .send({ message: "Sorry!No language related content!" })
        res.send(list)
    })

    // video language query
    ROUTER.get("/language/:language/:page", async (req, res) => {
        let list
        if (req.params.page > 500) res.status(204)
            .send({ message: "Sorry!No " + req.params.language + " content found!" })
        if (req.params.page == 1)
            list = await VIDEOS.find({ language: req.params.language })
                .skip(req.params.page).sort({ update: -1 }).limit(10).exec()
        else
            list = await VIDEOS.find({ language: req.params.language })
                .skip((req.params.page - 1) * 10).sort({ update: -1 }).limit(10).exec()
    })

    // video date
    ROUTER.get("/date/", async (req, res) => {
        let list = await aggregate("$released")
        if (list.length == 0) return res.status(204)
            .send({ message: "Sorry!No date related content!" })
        res.send(list)
    })
    
    // video date query
    ROUTER.get("/date/:date/:page", async (req, res) => {
        let list
        if (req.params.page > 500) res.status(204)
            .send({ message: "Sorry!Didn't find the content of " + req.params.date })
        if (req.params.page == 1)
            list = await VIDEOS.find({ released: req.params.date })
                .skip(req.params.page).sort({ update: -1 }).limit(10).exec()
        else
            list = await VIDEOS.find({ released: req.params.date })
                .skip((req.params.page - 1) * 10).sort({ update: -1 }).limit(10).exec()
        res.send(list)
    })

    // video area
    ROUTER.get("/area/", async (req, res) => {
        let list = await aggregate("$area")
        if (list.length == 0) res.status(204)
            .send({ message: "Sorry!No area related content!" })
        res.send(list)
    })

    // video area query
    ROUTER.get("/area/:area/:page", async (req, res) => {
        let list
        if (req.params.page > 500) res.status(204)
            .send({ message: "Sorry!No content found in " + req.params.area + "!" })
        if (req.params.page == 1)
            list = await VIDEOS.find({ area: req.params.area })
                .skip(req.params.page).sort({ update: -1 }).limit(10).exec()
        else
            list = await VIDEOS.find({ area: req.params.area })
                .skip((req.params.page - 1) * 10).sort({ update: -1 }).limit(10).exec()
        res.send(list)
    })

    // video details
    ROUTER.get("/video/:title", async (req, res) => {
        let video = await VIDEOS.findOne({ title: req.params.title }).exec()
        if (video == null) return res.status(204)
            .send({ message: "Sorry!《" + req.params.title + "》 is not found!" })
        res.send(video)
    })

    // video search
    ROUTER.get("/search/:key", async (req, res) => {
        res.send("search")
    })

    app.use("/api/video", ROUTER)
}