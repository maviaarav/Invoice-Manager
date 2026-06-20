const invoiceModel = require('../models/invoice');

/* =========================
   FINANCIAL YEAR
========================= */
const financialYear = (data = new Date()) => {
    const year = data.getFullYear();
    const month = data.getMonth() + 1;

    if (month >= 4) return `${year}-${year + 1}`;
    else return `${year - 1}-${year}`;
};

/* =========================
   INVOICE NUMBER GENERATOR
========================= */
const InvoiceNumber = async (userId, financialYear, Invoice) => {
    const count = await Invoice.countDocuments({ userId, financialYear });

    const next = String(count + 1).padStart(4, '0'); // FIXED

    return `INV-${financialYear.split('-')[0]}-${next}`;
};

/* =========================
   NORMALIZE ITEMS
========================= */
const NormalizeItems = (items) => {
    return items.map(item => {
        let amount = 0;

        if (item.quantity && item.rate) {
            amount = item.quantity * item.rate;
        } else {
            amount = item.amount || 0;
        }

        return {
            name: item.name,
            quantity: item.quantity || null,
            rate: item.rate || null,
            amount,
            isTaxable: item.isTaxable || false   // IMPORTANT FIX
        };
    });
};

/* =========================
   TAX CALCULATION
========================= */
const CalculateTax = (items, taxType) => {
    const taxableAmount = items
        .filter(item => item.isTaxable)
        .reduce((sum, item) => sum + item.amount, 0);

    if (taxType === 'cgst') {
        const cgst = taxableAmount * 0.09;
        const igst = 0;

        return { cgst, igst, taxableAmount };
    } else {
        const igst = taxableAmount * 0.18;
        const cgst = 0;

        return { cgst, igst, taxableAmount };
    }
};

/* =========================
   CREATE INVOICE
========================= */
const CreateInvoice = async (req, res) => {
    try {
        const {
            customerId,
            companyId,
            items,
            taxType = 'cgst',
        } = req.body;

        const financialYearValue = financialYear();

        const cleanItems = NormalizeItems(items);

        const subtotal = cleanItems.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const { cgst, igst } = CalculateTax(cleanItems, taxType);

        const totalAmount = subtotal + cgst + igst;

        const invoiceNumber = await InvoiceNumber(
            req.user._id,
            financialYearValue,
            invoiceModel
        );

        const invoice = new invoiceModel({
            userId: req.user._id,
            customerId,
            companyId,
            financialYear: financialYearValue,
            invoiceDate: new Date(),
            invoiceNumber,
            items: cleanItems,
            subtotal,
            cgst: {
                rate: taxType === 'cgst' ? 9 : 0,
                amount: cgst
            },
            igst: {
                rate: taxType === 'igst' ? 18 : 0,
                amount: igst
            },
            totalAmount
        });

        await invoice.save(); // IMPORTANT FIX

        return res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error creating invoice',
            error: err.message
        });
    }
};




/* =========================
   GET INVOICE BY ID
========================= */
const GetInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await invoiceModel.findById(id)
            .populate("customerId")
            .populate("companyId");

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({
            success: true,
            message: "Invoice retrieved successfully",
            data: invoice
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error retrieving invoice',
            error: err.message
        });
    }
};

/* =========================
   DELETE INVOICE
========================= */
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await invoiceModel.findByIdAndDelete(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({
            success: true,
            message: "Invoice deleted successfully",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error deleting invoice',
            error: err.message
        });
    }
};

/* =========================
   UPDATE INVOICE
========================= */
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            items,
            taxType
        } = req.body;

        const cleanItems = NormalizeItems(items);

        const { cgst, igst, taxableAmount } =
            CalculateTax(cleanItems, taxType);

        const subtotal = taxableAmount;

        const totalAmount = subtotal + cgst + igst;

        const invoice = await invoiceModel.findByIdAndUpdate(
            id,
            {
                items: cleanItems,
                subtotal,
                cgst: {
                    rate: taxType === 'cgst' ? 9 : 0,
                    amount: cgst
                },
                igst: {
                    rate: taxType === 'igst' ? 18 : 0,
                    amount: igst
                },
                totalAmount
            },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: invoice
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error updating invoice',
            error: err.message
        });
    }
};
const GetInvoices = async (req, res) => {
    try {
        const invoices = await invoiceModel.find({userId: req.user._id})
            .populate("customerId")
            .populate("companyId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Invoices retrieved successfully",
            data: invoices
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error retrieving invoices',
            error: err.message
        });
    }
}
/* =========================
   GET BY FINANCIAL YEAR
========================= */
const getAllInvoiceByFinancialYear = async (req, res) => {
    try {
        const { userId, financialYear } = req.query;

        const invoices = await invoiceModel.find({
            userId,
            financialYear
        })
            .populate("customerId")
            .populate("companyId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Invoices retrieved successfully",
            data: invoices
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error retrieving invoices',
            error: err.message
        });
    }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
    CreateInvoice,
    GetInvoices,
    GetInvoiceById,
    deleteInvoice,
    updateInvoice,
    getAllInvoiceByFinancialYear
};