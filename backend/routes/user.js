const express = require('express')
const router = express.Router()
const { HandlerLogin , SignUpHandler, getUserName } = require('../controllers/user')
const { restrictToLogin } = require('../middlewares/auth')

router.post('/signUp', SignUpHandler)
router.post('/login', HandlerLogin)
router.get('/signUp', (req,res)=>{
    res.send("Hello SIGN UP")
})
router.get('/login', (req,res)=>{
    res.send("HELLO, LOGIN")
})
router.get('/me',restrictToLogin,(req,res)=>{
    res.status(200).json({
        success: true,
        user: req.user
    })
})
router.get('/getUserName',restrictToLogin, getUserName)
router.get('/logout', (req, res) => {
    res.clearCookie('UUID');
    return res.json({
        success: true
    });
});
module.exports = router
