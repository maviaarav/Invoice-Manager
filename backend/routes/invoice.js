const express = require('express');
const router = express.Router();
const { restrictToLogin } = require('../middlewares/auth');
const { createInvoice, getInvoices,getSingleInvoice,deleteInvoice,updateInvoice,getAllInvoiceByFinancialYear,monthlyIncome } = require('../controllers/invoice');

router.post('/create', restrictToLogin, createInvoice);
router.get('/get', restrictToLogin, getInvoices);
router.get('/get/:id', restrictToLogin, getSingleInvoice);
router.delete('/delete/:id', restrictToLogin, deleteInvoice);
router.put('/update/:id', restrictToLogin, updateInvoice);
router.get('/year/:id', restrictToLogin, getAllInvoiceByFinancialYear);
router.get('/income/:year/:month', restrictToLogin, monthlyIncome);



module.exports = router;


