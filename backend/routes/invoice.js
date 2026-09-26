const express = require('express');
const router = express.Router();
const { restrictToLogin } = require('../middlewares/auth');
const { createInvoice, getInvoices,getSingleInvoice,deleteInvoice,updateInvoice,getAllInvoiceByFinancialYear,monthlyIncome,getInvoicesByDateRange,getInvoiceCount,getNextInvoiceNumber,invoiceAnnualReport} = require('../controllers/invoice');

router.post('/create', restrictToLogin, createInvoice);
router.get('/get', restrictToLogin, getInvoices);
router.get('/get/:id', restrictToLogin, getSingleInvoice);
router.delete('/delete/:id', restrictToLogin, deleteInvoice);
router.put('/update/:id', restrictToLogin, updateInvoice);
router.get('/year/:id', restrictToLogin, getAllInvoiceByFinancialYear);
router.get('/countyear/:id', restrictToLogin, getInvoiceCount);
router.get('/income/:year/:month', restrictToLogin, monthlyIncome);
router.get("/filter", restrictToLogin, getInvoicesByDateRange);
router.get("/next-invoice-number", restrictToLogin, getNextInvoiceNumber);
router.get("/annual-report/:id", restrictToLogin, invoiceAnnualReport);


module.exports = router;


