const express = require('express')
const { restrictToLogin } = require('../middlewares/auth')
const { connectGoogle, googleCallback } = require('../controllers/googleOauth')
const User = require('../models/user')

const router = express.Router()

router.get('/connect', connectGoogle)
router.get('/callback', googleCallback)

module.exports = router