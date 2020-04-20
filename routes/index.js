
const express=require("express")
const router=express.Router()
const auth=require("../config/auth")

router.get("/",(req,res)=>{
    res.render("welcome")
})

router.get("/dashboard",auth,(req,res)=>{
    res.redirect("http://nithinchat.herokuapp.com/")
})

module.exports=router