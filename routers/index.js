module.exports = app => {
    const express = require("express")
    const router = express.Router()
    const marked = require("marked")
    const Note = require("../modules/notes").notes
    const Tag = require("../modules/notes").tags
    const Directory = require("../modules/notes").dirs
    const ObjectId = require("mongoose").Types.ObjectId
    const User = require("../modules/user")
    const jwt = require("jsonwebtoken")
    const bcrypt = require("bcrypt")

    // Permission Validation
    const isLogin = async (req, res, next) => {
        const token = String(req.headers.authorization || '').split(' ').pop()
        if (!token) {
            return res.status(422).send({ message: "Please login!" })
        }
        console.log("令牌:" + token)
        const { id } = jwt.verify(token, app.get("sercret"))
        if (!id) {
            return res.status(422).send({ message: "Please login!" })
        }
        req.user = await User.findById(id)
        if (!req.user) {
            return res.status(422).send({ message: "Please login!" })
        }
        await next()
    }

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

    // index
    router.get("/", (req, res) => {
        res.render("index")
    })

    // note edit
    router.get("/edit/:title", async (req, res) => {
        const note = await Note.find({ title: req.params.title }).populate("tags")
            .populate("directory").exec()
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("edit", { title: req.params.title, note: note[0], lists, tags })
    })

    // note list
    router.get("/note", async (req, res) => {
        const notes = await Note.find().populate("directory").populate("tags").exec()
        if (notes != null) {
            for (index in notes) {
                if (notes[index].content != null) {
                    notes[index].content = marked(notes[index].content.substring(0, 100))
                }
                notes[index].date = notes[index].date.toString()
            }
        }
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.send({ notes, lists, tags })
    })

    // note create
    router.get("/edit", async (req, res) => {
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("edit", { title: "新建笔记", lists, tags })
    })

   // note descrption
    router.get("/note/:title", async (req, res) => {
        const note = await Note.findOne({ title: req.params.title })
                    .populate("directory").populate("tags").exec()
        if (note != null) {
            if (note.content != null) note.content = marked(note.content)
            note.date = new Date(note.date)
        }
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("content", { title: req.params.title, note, lists, tags })
    })

    // note query
    router.get("/dohave/:title", async (req, res) => {
        const note = await Note.findOne({ title: req.params.title }).populate("tags").populate("directory").exec()
        res.send(note)
    })

    // note query of tag
    router.post("/tag", async (req, res) => {
        const notelist = []
        for (index in req.body) {
            const temp = await Tag.findOne({ tag: req.body[index] }).exec()
            for (index in temp.notes) {
                if (temp.notes[index].length != [].length) {
                    if (notelist.indexOf(temp.notes[index]) == -1) notelist.push(temp.notes[index])
                }
            }
        }
        const notes = []
        for (index in notelist) {
            notes.push(await Note.findById(notelist[index]).populate("tags")
                .populate("directory").exec())
        }
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.send({ notes, lists, tags })
    })

    // note update
    router.put("/note", isLogin, async (req, res) => {
        await Note.updateMany({ _id: req.body._id }, {
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            directory: await dir(req.body._id, req.body.directory),
            tags: await tags(req.body._id, req.body.tags),
        }, { upsert: true })
        res.send("Update Success.")
    })

    // note save
    router.post("/note", isLogin, async (req, res) => {
        const model = new Note({
            _id: new ObjectId,
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
        })
        if (req.body.author) model.author = req.body.author
        model.directory = await dir(model._id, req.body.directory)
        model.tags = await tags(model._id, req.body.tags)
        model.save(function (err) {
            if (err) return err
        })
        res.send("Auto Save Success.")
    })
 
    // note delete
    router.delete("/note/:title",isLogin , async (req, res) => {
        const note = await Note.findOne({ title: req.params.title }).exec()
        if (note != undefined) {
            const note = await Note.find({ title: req.params.title }).exec()
            await Note.deleteOne({ title: req.params.title })
            const tags = await Tag.where("notes").in(note[0]._id)
            for (index in tags) {
                const have = tags[index].notes.indexOf(note[0]._id)
                tags[index].notes.splice(have, 1)
                if (tags[index].notes.length == 0) await Tag.deleteOne({ _id: tags[index]._id })
                else await Tag.updateMany({ _id: tags[index]._id }, tags[index])
            }
            const dir = await Directory.where("notes").in(note[0]._id)
            for (index in dir) {
                const have = dir[index].notes.indexOf(note[0]._id)
                dir[index].notes.splice(have, 1)
                if (dir[index].notes.length == 0) await Directory.deleteOne({ _id: dir[index] })
                else await Directory.updateMany({ _id: dir[index]._id }, dir[index])
            }
            res.send("Note delete success.")
        } else {
            res.send("Note does not exist.")
        }
    })

    // search
    router.get("/search/:params", async (req, res) => {
        let notes = await Note.find({ title: req.params.params })
            .populate("directory").populate("tags").exec()
        if (notes == null) {
            notes = await Note.find({ author: req.params.params })
                .populate("directory").populate("tags").exec()
        }
        res.send(notes)
    })

    // login
    router.get("/login", (req, res) => {
        res.render("login")
    })

    // login valid
    router.post("/login/", async (req, res) => {
        const { username, password } = req.body
        const user = await User.findOne({ username }).exec()
        if (!user) {
            return res.status(401).send({ message: "User or Password is faild" })
        }
        const isValid = bcrypt.compareSync(password, user.password)
        if (!isValid) {
            return res.status(401).send({ message: "User or Password is faild" })
        }
        const token = jwt.sign({
            id: user._id,
        }, app.get("sercret"))
        res.send({token, nickname: user.nickname})
    })

    app.use("/", router)
}