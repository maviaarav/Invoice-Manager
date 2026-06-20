const express = require('express');
const router = express.Router();
const { restrictToLogin } = require('../middlewares/auth');
const { CreateInvoice, GetInvoices,GetInvoiceById,deleteInvoice,updateInvoice,getAllInvoiceByFinancialYear } = require('../controllers/invoice');

router.post('/create', restrictToLogin, CreateInvoice);
router.get('/get', restrictToLogin, GetInvoices);
router.get('/get/:id', restrictToLogin, GetInvoiceById);
router.delete('/delete/:id', restrictToLogin, deleteInvoice);
router.put('/update/:id', restrictToLogin, updateInvoice);
router.get('/year', restrictToLogin, getAllInvoiceByFinancialYear);
module.exports = router;