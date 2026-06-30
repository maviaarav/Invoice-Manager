const ProformaInvoiceModel = require("../models/proformaInvoice");

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
    const count = await ProformaInvoiceModel.countDocuments({ financialYear });

    const nextNumber = count + 1;

    return `PROFORMA-INV/${financialYear}/${String(nextNumber).padStart(4, "0")}`;
};


const createInvoice = async (req, res) => {

    try {

        const {
            companyId,
            billingAddress,
            customerId,
            items,
            taxType,
            shippingAddress,
            placeOfSupply,
            cgstRate,
            sgstRate,
            igstRate,
            
        } = req.body;
        console.log("REQ BODY:", req.body);
        console.log("TAX TYPE:", req.body.taxType);
        const userId = req.user._id;

        const financialYear = getFinancialYear();


        const calculations = CalculateInvoiceAmount({
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        });
             
        const invoice = await ProformaInvoiceModel.create({
            userId,
            companyId,
            customerId,
            taxType,
            invoiceNumber: await getInvoiceNumber(financialYear),
            financialYear,
            invoiceDate: new Date().toLocaleDateString("en-IN",{ day: "numeric", month: "long", year: "numeric" }),
            shippingAddress,
            billingAddress,
            placeOfSupply,

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

        const invoices = await ProformaInvoiceModel
            .find({ userId })
            .populate("companyId")
            .populate("customerId")
            .sort({ createdAt: -1 });
        const invoiceCount = await ProformaInvoiceModel.countDocuments({ userId });
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


const getSingleInvoice = async (req, res) => {
    try {

        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await ProformaInvoiceModel
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


const deleteInvoice = async (req, res) => {
    try {

        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await ProformaInvoiceModel.findOneAndDelete({
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
        const invoices = await ProformaInvoiceModel.find({
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
            igstRate,
            shippingAddress,
            billingAddress
        } = req.body;

        const calculations = CalculateInvoiceAmount({
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        });

        const invoice = await ProformaInvoiceModel.findOneAndUpdate(
            { _id: invoiceId, userId },
            {
                companyId,
                customerId,
                items,
                shippingAddress,
                billingAddress,
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

    
const getAllInvoiceByFinancialYear = async (req, res) => {
    try {

        const userId = req.user._id;
        const financialYear = req.params.id;

        const invoices = await ProformaInvoiceModel
            .find({ userId, financialYear })
            .populate("companyId")
            .populate("customerId")
            .sort({ createdAt: -1 });
        const InvoiceCount = await ProformaInvoiceModel.countDocuments({userId})
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
const getInvoicesByDateRange = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const now = new Date();
    if (!startDate) {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = firstDay.toISOString();
    }
    if (!endDate) {
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      endDate = lastDay.toISOString();
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // ✅ force end-of-day regardless of input format

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const invoices = await ProformaInvoiceModel
      .find({ invoiceDate: { $gte: start, $lte: end } })
      .populate("companyId")
      .populate("customerId");

    res.status(200).json({ success: true, invoices, total: invoices.length });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
    createInvoice,
    getInvoices,
    getSingleInvoice,
    deleteInvoice,
    updateInvoice,
    getAllInvoiceByFinancialYear,
    monthlyIncome,
    getInvoicesByDateRange
};