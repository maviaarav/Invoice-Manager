const { getUser } = require('../utils/auth')

const restrictToLogin = async (req,res,next) =>{
    const id = req.cookies && req.cookies.UUID
    if(!id){
        return res.redirect('/user/login')
    }
    const user = getUser(id)
    if(!user){
        return res.redirect('/user/login')
    }
    req.user = user
    next()
}

module.exports = {
    restrictToLogin
}