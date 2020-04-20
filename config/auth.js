const jwt=require("jsonwebtoken")
const config=require("config")


module.exports=function(req,res,next){
    try{
        const token=require("../routes/users")
        const decoded=jwt.verify(token,config.get("jwtPrivateKey1"))
        if(decoded){
            return next()
        }
    }
    catch(ex){
    req.flash("error_msg","please login to access this")
    res.redirect("/users/login")
    }
}