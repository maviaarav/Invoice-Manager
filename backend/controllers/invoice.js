const InvoiceModel = require("../models/invoice");

/* =========================
   CALCULATION FUNCTION
========================= */
const CalculateInvoiceAmount = ({
    items,
    taxType,
    cgstRate = 0,
    sgstRate = 0,
    igstRate = 0
}) => {

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const taxableAmount = items
        .filter(item => item.isTaxable)
        .reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "CGST_SGST") {
        cgstAmount = taxableAmount * cgstRate / 100;
        sgstAmount = taxableAmount * sgstRate / 100;
    }

    if (taxType === "IGST") {
        igstAmount = taxableAmount * igstRate / 100;
    }

    const totalTax = cgstAmount + sgstAmount + igstAmount;

    const totalAmount = subtotal + totalTax;

    return {
        subtotal,
        cgst: {
            rate: cgstRate,
            amount: cgstAmount
        },
        sgst: {
            rate: sgstRate,
            amount: sgstAmount
        },
        igst: {
            rate: igstRate,
            amount: igstAmount
        },
        totalTax,
        totalAmount
    };
};


const getFinancialYear = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return month >= 4
        ? `${year}-${year + 1}`
        : `${year - 1}-${year}`;
};



const getInvoiceNumber = async (financialYear) => {
    const count = await InvoiceModel.countDocuments({ financialYear });

    const nextNumber = count + 1;

    return `INV/${financialYear}/${String(nextNumber).padStart(4, "0")}`;
};


const createInvoice = async (req, res) => {

    try {

        const {
            companyId,
            
            customerId,
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        } = req.body;
        console.log("REQ BODY:", req.body);
        console.log("TAX TYPE:", req.body.taxType);
        const userId = req.user._id;

        const financialYear = getFinancialYear();

        const invoiceNumber = await getInvoiceNumber(financialYear);

        const calculations = CalculateInvoiceAmount({
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        });

        const invoice = await InvoiceModel.create({
            userId,
            companyId,
            customerId,
            taxType,
            invoiceNumber,
            financialYear,
            invoiceDate: new Date().toISOString(),

            items,

            subtotal: calculations.subtotal,

            cgst: {
                rate: cgstRate || 0,
                amount: calculations.cgst.amount
            },

            sgst: {
                rate: sgstRate || 0,
                amount: calculations.sgst.amount
            },

            igst: {
                rate: igstRate || 0,
                amount: calculations.igst.amount
            },

            totalTax: calculations.totalTax,
            totalAmount: calculations.totalAmount
        });

        return res.status(201).json({
            Msg: "Invoice Created Successfully",
            invoice
        });

    } catch (error) {
        return res.status(500).json({
            Msg: "Error while Creating Invoice",
            error: error.message
        });
    }
};


const getInvoices = async (req, res) => {
    try {

        const userId = req.user._id;

        const invoices = await InvoiceModel
            .find({ userId })
            .populate("companyId")
            .populate("customerId")
            .sort({ createdAt: -1 });
        const invoiceCount = await InvoiceModel.countDocuments({ userId });
        if (!invoices || invoices.length === 0) {
            return res.status(404).json({
                Msg: "No Invoices Found"
            });
        } 

        return res.status(200).json({
            Msg: "Invoices Fetched Successfully",
            invoices,
            invoiceCount
        });

    } catch (error) {
        return res.status(500).json({
            Msg: "Error while Fetching Invoice",
            error: error.message
        });
    }
};


/* =========================
   GET SINGLE INVOICE
========================= */
const getSingleInvoice = async (req, res) => {
    try {

        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await InvoiceModel
            .findOne({ _id: invoiceId, userId })
            .populate("companyId")
            .populate("customerId");

        if (!invoice) {
            return res.status(404).json({
                Msg: "Invoice Not Found"
            });
        }

        return res.status(200).json({
            Msg: "Invoice Fetched Successfully",
            invoice
        });

    } catch (error) {
        return res.status(500).json({
            Msg: "Error while Fetching Invoice",
            error: error.message
        });
    }
};


/* =========================
   DELETE INVOICE
========================= */
const deleteInvoice = async (req, res) => {
    try {

        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await InvoiceModel.findOneAndDelete({
            _id: invoiceId,
            userId
        });

        if (!invoice) {
            return res.status(404).json({
                Msg: "Invoice Not Found"
            });
        }

        return res.status(200).json({
            Msg: "Invoice Deleted Successfully",
            invoice
        });

    } catch (error) {
        return res.status(500).json({
            Msg: "Error while Deleting Invoice",
            error: error.message
        });
    }
};



const monthlyIncome = async (req,res) =>{
    try{
        const userId = req.user._id
        const { year, month } = req.params
        const startdate = new Date(year, month-1, 1)
        const endDate = new Date(year, month,1)
        const invoices = await InvoiceModel.find({
            userId,
            invoiceDate: {
                $gte: startdate,
                $lt: endDate
            }
        })
        const totalIncome = invoices.reduce(
            (sum, inv) => sum + inv.totalAmount, 0
        )
        res.status(201).json({
        month,
        year,
        totalIncome,
        totalInvoices: invoices.length
        })
    }
    catch(error){
        return res.status(403).json({Msg: "Error while Calculating Monthly Income", error: error.message})
    }
}





const updateInvoice = async (req, res) => {
    try {

        const userId = req.user._id;
        const invoiceId = req.params.id;

        const {
            companyId,
            customerId,
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        } = req.body;

        const calculations = CalculateInvoiceAmount({
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        });

        const invoice = await InvoiceModel.findOneAndUpdate(
            { _id: invoiceId, userId },
            {
                companyId,
                customerId,
                items,

                subtotal: calculations.subtotal,

                cgst: {
                    rate: cgstRate || 0,
                    amount: calculations.cgst.amount
                },

                sgst: {
                    rate: sgstRate || 0,
                    amount: calculations.sgst.amount
                },

                igst: {
                    rate: igstRate || 0,
                    amount: calculations.igst.amount
                },

                totalTax: calculations.totalTax,
                totalAmount: calculations.totalAmount
            },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                Msg: "Invoice Not Found"
            });
        }

        return res.status(200).json({
            Msg: "Invoice Updated Successfully",
            invoice
        });

    } catch (error) {
        return res.status(500).json({
            Msg: "Error while Updating Invoice",
            error: error.message
        });
    }
};


/* =========================
   FILTER BY FINANCIAL YEAR
========================= */
const getAllInvoiceByFinancialYear = async (req, res) => {
    try {

        const userId = req.user._id;
        const financialYear = req.params.id;

        const invoices = await InvoiceModel
            .find({ userId, financialYear })
            .populate("companyId")
            .populate("customerId")
            .sort({ createdAt: -1 });
        const InvoiceCount = await InvoiceModel.countDocuments({userId})
        if (!invoices || invoices.length === 0) {
            return res.status(404).json({
                Msg: "No Invoices Found for the specified financial year"
            });
        }
        return res.status(200).json({
            Msg: "Invoices Fetched Successfully",
            invoices,
            InvoiceCount
        });

    } catch (error) {
        return res.status(500).json({
            Msg: "Error while Fetching Invoice",
            error: error.message
        });
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getSingleInvoice,
    deleteInvoice,
    updateInvoice,
    getAllInvoiceByFinancialYear,
    monthlyIncome
};