const { getUser } = require('../utils/auth')


const restrictToLogin = async (req,res,next) =>{
    const id = req.cookies && req.cookies.UUID
    if(!id){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    const user = getUser(id)
    if(!user){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    req.user = user
    next()
}

module.exports = {
    restrictToLogin
}