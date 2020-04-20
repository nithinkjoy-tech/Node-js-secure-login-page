const express = require("express")
const nodemailer = require('nodemailer');
const router = express.Router()
const User = require("../models/user")
const Joi = require("@hapi/joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("config")

if (!config.get("jwtPrivateKey1")) {
    console.log("Fattal error:Jwt private key 1 not defined")
    process.exit(1)
}

if (!config.get("jwtPrivateKey2")) {
    console.log("Fattal error:Jwt private key 2 not defined")
    process.exit(1)
}

router.get("/login", (req,res) => {
    res.render("login")
})

router.get("/register", (req,res) => {
    res.render("register")
})

router.get("/verification/:id",(req,res)=>{
    const query_string = req.query
    const tok=query_string.tok
    const decoded_query=jwt.verify(tok,config.get("jwtPrivateKey2"))
    if(!decoded_query) return res.send("invalid url")
    res.render("verify_login")
})


error_message = ""
router.post("/register", async (req, res) => {  
    const {error} = fn1(req.body)
    if (error) {
        error_message = error.details[0].message
        res.render("register", {error_message})
        return error_message = ""
    }
 
    if (req.body.password != req.body.password2) {
        error_message = "passwords does not match"
        res.render("register", {error_message})
        return error_message = ""
    }

    const eml = await User.findOne({email: req.body.email})
    if (eml) {
        error_message = "email already exist"
        res.render("register", {error_message})
        return error_message = ""
    }

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(req.body.password, salt)

    
    const token=jwt.sign({email:req.body.email},config.get("jwtPrivateKey2"))

    const users = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashed,
        token:token
    })

    const result = await users.save();

    const url=`nithinlogin.herokuapp.com/users/verification/verify?tok=${token}`


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nithinjoyapp@gmail.com',
        pass: 'mss32.dll'
      }
    });
    
    var mailOptions = {
      from: 'nithinjoyapp@gmail.com',
      to: req.body.email,
      subject: 'Verifying account',
      html:`<h2>Hello Dear ${req.body.name}</h2>
            <p>               Thank you for using our app. Please verify you account using the following link below.</p>
            <h2 style="color:red">This link will expire after 24 hours. If not verified your account will also be deleted</h2>
             We will provide you the best service we can. Have a good day.
            <h4><a href=${url}>${url}</a></h4>

            <h3><b>Nithin K Joy (CEO)</b></h3>`       
    };
    
    transporter.sendMail(mailOptions, (error, info)=>{
      if (error) return console.log(error);
        console.log('Email sent: ' + info.response);
    });

    
    console.log(result)
    error_message = ""
    res.render("just_registered")
})


router.post("/verification",async(req,res)=>{
    
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        error = "E-mail not registered"
        return res.render("verify_login", {error})
    }

    const pass = await bcrypt.compare(req.body.password, user.password)
    if (!pass) {
        error = "Invalid password"
        return res.render("verify_login", {error})
    }


    try{
    const user =await User.findOne({email:req.body.email})
    if(user){
        user.verified=true
        await user.save()
        await User.update({_id:user._id},{$unset: {token:1}})
        await User.update({_id:user._id},{$unset: {expireAt:1}})
        const token = jwt.sign({id: user._id}, config.get("jwtPrivateKey1"))
        module.exports = token
        res.render("verified")
    }
    }
    catch(ex){
        res.send(ex)
    }

})


router.post("/login", async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        error = "E-mail not registered"
        return res.render("login", {error})
    }

    const pass = await bcrypt.compare(req.body.password, user.password)
    if (!pass) {
        error = "Invalid password"
        return res.render("login", {error})
    }

    if(!user.verified){
        error="Your account is not verified, We have sent you a mail, please open your E-mail to get verification link"
        return res.render("login",{error})
    }

    const token = jwt.sign({id: User._id}, config.get("jwtPrivateKey1"))
    module.exports = token
    res.redirect("/dashboard")
})

router.get("/logout", (req, res) => {
    const token = ""
    module.exports = token
    req.flash("success_msg", "you are logged out")
    res.redirect("/users/login")
})

function fn1(msg) {

    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().min(3).max(100).required(),
        password: Joi.string().min(6).max(1024).required(),
        password2: Joi.string().required()
    })
    return schema.validate(msg)
}

module.exports = router