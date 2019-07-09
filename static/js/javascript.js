new Vue({
    el: "#app",
    data () {
        return {
            isCollapsed: false,
            buttonSize: "small",
            model: { tags: [] },
        };
    },
    computed: {
        menuitemClasses () {
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu' : ''
            ]
        }
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
                const noteget = await axios.get("/" + this.model._id)
                console.log(noteget)
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
        addtag () {
            const tag = addtag.innerText.slice(0, -1)
            if (this.regex(addtag.innerText)) {
                this.$Message.warning("非法输入")
                addtag.innerText = ""
                return
            }
            if (tag != "") {
                this.model.tags.push(tag)
            }
            addtag.innerText= ""
        },
        deltag (tag) {
            const i = this.model.tags.indexOf(tag)
            this.model.tags.splice(i, 1)
            this.$Message.success("删除标签成功")
        },
        delnote (id) {
            const res = axios.delete("/note", id)
            this.$Message.success({
                content: res.data,
            })
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