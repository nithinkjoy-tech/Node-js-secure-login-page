
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const index = require("./routes/index")
const users = require("./routes/users")
const expressLayout = require("express-ejs-layouts")
const flash = require("connect-flash")
const session = require("express-session")
require("./routes/prod")(app)

const db = require("./config/keys").MongoURI
mongoose.connect(db, {useNewUrlParser: true})
        .then(() => console.log("connected to database"))
        .catch(err => console.log(err))

app.use(expressLayout)
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))

app.use(session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
}))

app.use(flash())
app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        next()
})

app.use("/", index)
app.use("/users", users)



const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening to port ${port}`))