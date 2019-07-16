const vm =new Vue({
    el: "#app",
    data () {
        return {
            isCollapsed: false,
            buttonSize: "small",
            notes: [],
            model: { tags: [] },
            tags: [],
        }
    },
    computed: {
        menuitemClasses () {
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu' : ''
            ]
        }
    },
    async created () {
        this.notes = await axios.get("/note")
    },
    methods: {
        conversion () {
            this.model.content = myedit.innerText
            mdarea.innerHTML = marked(this.model.content)
        },
        async autosave () {
            if (directory.innerText != "" && title.innerText !="") {
                this.model.directory = directory.innerText
                this.model.title = title.innerText
                const noteget = await axios.get("/" + this.model.title)
                if (noteget.data == "" ) {
                    const res = await axios.post("/note", this.model)
                    this.$Message.success({
                        content: res.data,
                        duration: 5
                    })
                } else {
                    this.model._id = noteget.data._id
                    const res = await axios.put("/note", this.model)
                    this.$Message.success({
                        content: res.data,
                        duration: 5
                    })
                }
            }
            else {
                this.$Message.warning("目录名或者标题不能为空")
            }
        },
       async delnote () {
            const res = await axios.delete("/note/" + title.innerText)
            this.$Message.success({
                content: res.data,
                duration: 5
            })
            window.location.href = "/"
        },
        async downtag (checked, tag) {
            const index = this.model.tags.indexOf(tag)
            if (index == -1) this.model.tags.push(tag)
            else this.model.tags.splice(index, 1)
            if (this.model.tags.length != 0) {
                this.notes = await axios.post("/tag", this.model.tags)
            } else this.notes = await axios.get("/note")
        },
        deltag (tag) {
            const i = this.model.tags.indexOf(tag)
            this.model.tags.splice(i, 1)
            this.$Message.success("删除标签成功")
        },
        async tagselect (checked, name) {
            alert(checked)
        },
        addtag () {
            const tag = addtag.innerText.slice(0, -1)
            if (this.regex(addtag.innerText)) {
                this.$Message.warning("非法输入")
                addtag.innerText = ""
                return
            }
            if (tag != "") {
                if (this.model.tags.indexOf(tag) == -1) {
                    this.model.tags.push(tag)
                }
            }
            addtag.innerText= ""
        },
        choosetag (checked, item) {
            console.log(item)
            tag = JSON.parse(item).item.tag
            if (checked) this.tags.push(tag)
            else {
                const i = this.tags.indexOf(tag)
                this.tags.splice(i, 1)
            }
            axios.post("/tag", this.tags)
        },
        regex (str) {
            const regx = /[\~\!\@\#\$\%\^\&\*\(\)\_\+\{\}\|\:\"\>\?\`\-\=\[\]\\;'\.\/～！·￥……（）——《》？、]/
            if(regx.test(str)){
                return true
            }
            return false
        }
    }
})