const express = require('express')
const router = express.Router()
const { createClient, getClient, updateClient, deleteClient,  getClientAll, recentClient } = require('../controllers/client')
const { restrictToLogin } = require('../middlewares/auth')

router.post('/create', restrictToLogin, createClient)
router.get('/get/:email', restrictToLogin, getClient)
router.get('/get', restrictToLogin, getClientAll)
router.put('/update/:id', restrictToLogin, updateClient)
router.delete('/delete/:id', restrictToLogin, deleteClient)
router.get('/recent',restrictToLogin,recentClient)

module.exports = router