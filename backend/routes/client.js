const express = require('express')
const router = express.Router()
const { createClient, getClient, updateClient, deleteClient,  getClientAll } = require('../controllers/client')
const { restrictToLogin } = require('../middlewares/auth')

router.post('/create', restrictToLogin, createClient)
router.get('/get/:email', restrictToLogin, getClient)
router.get('/get', restrictToLogin, getClientAll)
router.put('/update/:email', restrictToLogin, updateClient)
router.delete('/delete/:email', restrictToLogin, deleteClient)

module.exports = router