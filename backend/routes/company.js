const express = require('express')
const router = express.Router()
const multer = require('multer');
const { createCompany, getCompany, updateCompany, deleteCompany } = require('../controllers/company')
const { restrictToLogin } = require('../middlewares/auth')

const storage = multer.memoryStorage();
const upload = multer({
    storage
});

router.get('/get', restrictToLogin, getCompany)
router.post(
    '/create',
    restrictToLogin,
    upload.fields([
        { name: 'signature', maxCount: 1 },
        { name: 'stamp', maxCount: 1 }
    ]),
    createCompany
)
router.put('/update/:id', 
    restrictToLogin, 
    upload.fields([
        { name: 'signature', maxCount: 1 },
        { name: 'stamp', maxCount: 1 }
    ]),
    updateCompany)

router.delete('/delete/:email', restrictToLogin, deleteCompany)

module.exports = router