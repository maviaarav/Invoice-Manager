const express = require('express')
const router = express.Router()
const { createCompany, getCompany, updateCompany } = require('../controllers/company')
const { restrictToLogin } = require('../middlewares/auth')



router.post('/create', restrictToLogin,createCompany)
router.put('/update', restrictToLogin, updateCompany)
router.get('/get', restrictToLogin, getCompany)


module.exports = router