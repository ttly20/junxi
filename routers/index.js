module.exports = app => {
    const express = require("express")
    const router = express.Router()
    const marked = require("marked")
    const Note = require("../modules/notes").notes
    const Tag = require("../modules/notes").tags
    const Directory = require("../modules/notes").dirs
    const ObjectId = require("mongoose").Types.ObjectId

    // tag manage
    async function tags (model, tags) {
        const items = []
        for (index in tags) {
            const res = await Tag.findOne({ tag: tags[index] })
            if (res == null) {
               const nohave = await Tag.insertMany({
                    tag: tags[index], notes: model
                })
                items.push(nohave[0]._id)
            } else {
                const dohave = res.notes
                if (dohave.indexOf(ObjectId(model)) == -1) dohave.push(ObjectId(model))
                await Tag.updateMany({ _id: res._id },
                    { notes: dohave }, { upsert: true })
                items.push(res._id)
            }
        }
        return items
    }

    // directory manage
    async function dir(model, dir) {
        const res = await Directory.findOne({ directory: dir })
        if (res == null) {
            const nohave = await Directory.insertMany({
                directory: dir, notes: model
            })
            return nohave[0]._id
        } else {
            const dohave = res.notes
            if (dohave.indexOf(ObjectId(model)) == -1) dohave.push(ObjectId(model))
            await Directory.updateMany({ _id: res._id },
                { notes: dohave }, { upsert: true })
            return res._id
        }
    }

    // index / note list
    router.get("/", async (req, res) => {
        const notes = await Note.find().populate("tags")
            .populate("directory").exec()
        for (index in notes) {
            if (notes[index].content != undefined) {
                notes[index].content = marked(notes[index]
                    .content.substring(0, 100))
            }
        }
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("index", { title: "首页", notes, lists, tags })
    })

    // note edit
    router.get("/edit/:title", async (req, res) => {
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("edit", { title: req.params.title, lists, tags })
    })

    router.get("/edit", async (req, res) => {
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("edit", { title: "新建笔记", lists, tags })
    })

    // note save
    router.post("/note", async (req, res) => {
        const model = new Note({
            _id: new ObjectId,
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
        })
        model.directory = await dir(model._id, req.body.directory)
        model.tags = await tags(model._id, req.body.tags)
        model.save(function (err) {
            if (err) return err
        })
        res.send("Auto Save Success.")
    })

    // note descrption
    router.get("/:title", async (req, res) => {
        const note = await Note.findOne({ title: req.params.title })
                    .populate("directory").populate("tags").exec()
        note.content = marked(note.content)
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("content", { title: req.params.title, note, lists, tags })
    })

    // note query
    router.get("/note/:title", async (req, res) => {
        const note = await Note.findOne({ title: req.params.title }).exec()
        res.send(note)
    })

    // note update
    router.put("/note", async (req, res) => {
        await Note.updateMany({ _id: req.body._id }, {
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            directory: await dir(req.body._id, req.body.directory),
            tags: await tags(req.body._id, req.body.tags),
        }, { upsert: true })
        res.send("Update Success.")
    })

    // note delete
    router.delete("/note/:title", async (req, res) => {
        const a = await Note.deleteOne({ title: req.params.title }, function (err) {
            if (err) return err
        })
        res.send("Delete Success.")
    })

    router.get("/tag/:tag", async (req, res) => {
        const note =  await Tag.find({ tag:tag }).exec()
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("index", note, tags, lists)
    })

    app.use("/", router)
}