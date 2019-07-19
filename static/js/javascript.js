const vm =new Vue({
    el: "#app",
    data () {
        return {
            isCollapsed: false,
            buttonSize: "small",
            notes: [],
            model: { tags: [] },
            tags: [],
            notesearch: "",
            user: {},
            islogin: false,
            http: axios.create(),
            lists: [],
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
        if (localStorage.token) this.islogin = true
        this.http.interceptors.request.use(function (config) {
            // Do something before request is sent
            if (localStorage.token) {
                config.headers.Authorization = 'Bearer ' + (localStorage.token || "")
            }
            return config
        }, function (error) {
            // Do something with request error
            return Promise.reject(error)
        })
        this.http.interceptors.response.use(res => {
            // 对响应数据做点什么
            return res.data
        }, err => {
            // 对响应错误做点什么
            if (err.response.data.message) {
                this.$Message.error({
                    content: err.response.data.message,
                    duration: 5
                })
            }
            return Promise.reject(err)
        })
        const res = await this.http.get("/note")
        this.notes = res.notes
        this.lists = res.lists
        this.tags = res.tags
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
                const noteget = await this.http.get("/dohave/" + this.model.title)
                if (noteget.data == "" ) {
                    const res = await this.http.post("/note", this.model)
                    this.$Message.success({
                        content: res.data,
                        duration: 5
                    })
                } else {
                    this.model._id = noteget.data._id
                    const res = await this.http.put("/note", this.model)
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
            const res = await this.http.delete("/note/" + title.innerText)
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
                let res = await this.http.post("/tag", this.model.tags)
                this.notes = res
            } else {
                let res = await this.http.get("/note")
                this.notes = res.notes
            }
        },
        deltag (tag) {
            const i = this.model.tags.indexOf(tag)
            this.model.tags.splice(i, 1)
            this.$Message.success("删除标签成功")
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
        async noteSearch () {
            if (this.notesearch != "") {
                 this.notes.data.notes = await this.http.get("/search/" + this.notesearch)
                    .then((response) => {
                    return response.data
                })
                this.notesearch = ""
            } else this.notesearch = ""
        },
        async login () {
            if (this.user) {
                const res = await this.http.post("/login", this.user)
                localStorage.token = res.data.token
                console.log(res.data)
                this.model.nickname = res.data.nickname
                window.location.href = "/"
            }
        },
        logout () {
            localStorage.token = ""
            window.location.href = "/"
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