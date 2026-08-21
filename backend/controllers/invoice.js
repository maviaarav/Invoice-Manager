const InvoiceModel = require("../models/invoice");

/* =========================================================
   CALCULATE INVOICE AMOUNT
========================================================= */
const CalculateInvoiceAmount = ({
    items = [],
    taxType,
    cgstRate = 0,
    sgstRate = 0,
    igstRate = 0
}) => {
    const safeItems = Array.isArray(items) ? items : [];

    const subtotal = safeItems.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const taxableAmount = safeItems
        .filter((item) => item.isTaxable === true)
        .reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

    const safeCgstRate = Number(cgstRate || 0);
    const safeSgstRate = Number(sgstRate || 0);
    const safeIgstRate = Number(igstRate || 0);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "CGST_SGST") {
        cgstAmount = (taxableAmount * safeCgstRate) / 100;
        sgstAmount = (taxableAmount * safeSgstRate) / 100;
    }

    if (taxType === "IGST") {
        igstAmount = (taxableAmount * safeIgstRate) / 100;
    }

    const totalTax =
        cgstAmount +
        sgstAmount +
        igstAmount;

    const totalAmount =
        subtotal +
        totalTax;

    return {
        subtotal,

        cgst: {
            rate: safeCgstRate,
            amount: cgstAmount
        },

        sgst: {
            rate: safeSgstRate,
            amount: sgstAmount
        },

        igst: {
            rate: safeIgstRate,
            amount: igstAmount
        },

        totalTax,
        totalAmount
    };
};


/* =========================================================
   GET FINANCIAL YEAR
   Example:
   April 2026 -> 2026-2027
   March 2027 -> 2026-2027
========================================================= */
const getFinancialYear = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return month >= 4
        ? `${year}-${year + 1}`
        : `${year - 1}-${year}`;
};


/* =========================================================
   CREATE INVOICE
========================================================= */
const createInvoice = async (req, res) => {
    try {
        const {
            companyId,
            billingAddress,
            customerId,
            items,
            taxType,
            invoiceNumber,
            shippingAddress,
            placeOfSupply,
            cgstRate,
            sgstRate,
            igstRate,
            PoNumber,
            PODate,
            ServiceOrderNumber,
            ServiceOrderDate
        } = req.body;

        console.log("REQ BODY:", req.body);
        console.log("TAX TYPE:", taxType);

        /* -------------------------
           CHECK USER
        ------------------------- */
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized. User not found."
            });
        }

        const userId = req.user.userId || req.user._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized. User ID not found."
            });
        }

        /* -------------------------
           VALIDATE ITEMS
        ------------------------- */
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                Msg: "Invoice must contain at least one item."
            });
        }

        /* -------------------------
           FINANCIAL YEAR
        ------------------------- */
        const financialYear = getFinancialYear();

        /* -------------------------
           CALCULATE AMOUNTS
        ------------------------- */
        const calculations = CalculateInvoiceAmount({
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        });

        /* -------------------------
           CREATE INVOICE
        ------------------------- */
        const invoice = await InvoiceModel.create({
            userId,
            companyId,
            customerId,

            taxType,
            invoiceNumber,
            financialYear,

            invoiceDate: new Date(),

            billingAddress,
            shippingAddress,
            placeOfSupply,

            PoNumber,
            PODate,

            ServiceOrderNumber,
            ServiceOrderDate,

            items,

            subtotal: calculations.subtotal,

            cgst: {
                rate: calculations.cgst.rate,
                amount: calculations.cgst.amount
            },

            sgst: {
                rate: calculations.sgst.rate,
                amount: calculations.sgst.amount
            },

            igst: {
                rate: calculations.igst.rate,
                amount: calculations.igst.amount
            },

            totalTax: calculations.totalTax,
            totalAmount: calculations.totalAmount
        });

        return res.status(201).json({
            success: true,
            Msg: "Invoice Created Successfully",
            invoice
        });

    } catch (error) {
        console.error("CREATE INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            Msg: "Error while Creating Invoice",
            error: error.message
        });
    }
};


/* =========================================================
   GET ALL INVOICES
========================================================= */
const getInvoices = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;

        const invoices = await InvoiceModel
            .find({ userId })
            .populate("companyId")
            .populate("customerId")
            .sort({ createdAt: -1 });

        const invoiceCount = await InvoiceModel.countDocuments({
            userId
        });

        return res.status(200).json({
            success: true,
            Msg: "Invoices Fetched Successfully",
            invoices,
            invoiceCount
        });

    } catch (error) {
        console.error("GET INVOICES ERROR:", error);

        return res.status(500).json({
            success: false,
            Msg: "Error while Fetching Invoice",
            error: error.message
        });
    }
};


/* =========================================================
   GET SINGLE INVOICE
========================================================= */
const getSingleInvoice = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;
        const invoiceId = req.params.id;

        const invoice = await InvoiceModel
            .findOne({
                _id: invoiceId,
                userId
            })
            .populate("companyId")
            .populate("customerId");

        if (!invoice) {
            return res.status(404).json({
                success: false,
                Msg: "Invoice Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            Msg: "Invoice Fetched Successfully",
            invoice
        });

    } catch (error) {
        console.error("GET SINGLE INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            Msg: "Error while Fetching Invoice",
            error: error.message
        });
    }
};


/* =========================================================
   DELETE INVOICE
========================================================= */
const deleteInvoice = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;
        const invoiceId = req.params.id;

        const invoice = await InvoiceModel.findOneAndDelete({
            _id: invoiceId,
            userId
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                Msg: "Invoice Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            Msg: "Invoice Deleted Successfully",
            invoice
        });

    } catch (error) {
        console.error("DELETE INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            Msg: "Error while Deleting Invoice",
            error: error.message
        });
    }
};


/* =========================================================
   MONTHLY INCOME
========================================================= */
const monthlyIncome = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;

        const { year, month } = req.params;

        const numericYear = Number(year);
        const numericMonth = Number(month);

        if (
            !Number.isInteger(numericYear) ||
            !Number.isInteger(numericMonth) ||
            numericMonth < 1 ||
            numericMonth > 12
        ) {
            return res.status(400).json({
                success: false,
                Msg: "Invalid year or month"
            });
        }

        const startDate = new Date(
            numericYear,
            numericMonth - 1,
            1
        );

        const endDate = new Date(
            numericYear,
            numericMonth,
            1
        );

        const invoices = await InvoiceModel.find({
            userId,
            invoiceDate: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const totalIncome = invoices.reduce(
            (sum, invoice) =>
                sum + Number(invoice.totalAmount || 0),
            0
        );

        return res.status(200).json({
            success: true,
            month: numericMonth,
            year: numericYear,
            totalIncome,
            totalInvoices: invoices.length
        });

    } catch (error) {
        console.error("MONTHLY INCOME ERROR:", error);

        return res.status(500).json({
            success: false,
            Msg: "Error while Calculating Monthly Income",
            error: error.message
        });
    }
};


/* =========================================================
   UPDATE INVOICE
========================================================= */
const updateInvoice = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;
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
            billingAddress,
            placeOfSupply,
            PoNumber,
            PODate,
            ServiceOrderNumber,
            ServiceOrderDate
        } = req.body;

        /* -------------------------
           VALIDATE ITEMS
        ------------------------- */
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                Msg: "Invoice must contain at least one item."
            });
        }

        /* -------------------------
           CALCULATE AMOUNTS
        ------------------------- */
        const calculations = CalculateInvoiceAmount({
            items,
            taxType,
            cgstRate,
            sgstRate,
            igstRate
        });

        /* -------------------------
           UPDATE INVOICE
        ------------------------- */
        const invoice = await InvoiceModel.findOneAndUpdate(
            {
                _id: invoiceId,
                userId
            },
            {
                companyId,
                customerId,

                taxType,

                items,

                shippingAddress,
                billingAddress,
                placeOfSupply,

                PoNumber,
                PODate,

                ServiceOrderNumber,
                ServiceOrderDate,

                subtotal: calculations.subtotal,

                cgst: {
                    rate: calculations.cgst.rate,
                    amount: calculations.cgst.amount
                },

                sgst: {
                    rate: calculations.sgst.rate,
                    amount: calculations.sgst.amount
                },

                igst: {
                    rate: calculations.igst.rate,
                    amount: calculations.igst.amount
                },

                totalTax: calculations.totalTax,
                totalAmount: calculations.totalAmount
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                Msg: "Invoice Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            Msg: "Invoice Updated Successfully",
            invoice
        });

    } catch (error) {
        console.error("UPDATE INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            Msg: "Error while Updating Invoice",
            error: error.message
        });
    }
};


/* =========================================================
   GET INVOICES BY FINANCIAL YEAR
========================================================= */
const getAllInvoiceByFinancialYear = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                Msg: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;

        const financialYear = req.params.id;

        if (!financialYear) {
            return res.status(400).json({
                success: false,
                Msg: "Financial year is required"
            });
        }

        const invoices = await InvoiceModel
            .find({
                userId,
                financialYear
            })
            .populate("companyId")
            .populate("customerId")
            .sort({ createdAt: -1 });

        /* IMPORTANT:
           Count only invoices from the selected
           financial year.
        */
        const invoiceCount =
            await InvoiceModel.countDocuments({
                userId,
                financialYear
            });

        return res.status(200).json({
            success: true,
            Msg: "Invoices Fetched Successfully",
            invoices,
            invoiceCount
        });

    } catch (error) {
        console.error(
            "GET FINANCIAL YEAR INVOICES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            Msg: "Error while Fetching Invoice",
            error: error.message
        });
    }
};


/* =========================================================
   GET INVOICES BY DATE RANGE
========================================================= */
const getInvoicesByDateRange = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userId = req.user.userId || req.user._id;

        let { startDate, endDate } = req.query;

        const IST = "+05:30";

        /* -------------------------
           DEFAULT CURRENT MONTH
        ------------------------- */
        if (!startDate || !endDate) {
            const now = new Date();

            const firstDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            const lastDay = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            );

            const pad = (number) =>
                String(number).padStart(2, "0");

            if (!startDate) {
                startDate =
                    `${firstDay.getFullYear()}-` +
                    `${pad(firstDay.getMonth() + 1)}-` +
                    `${pad(firstDay.getDate())}`;
            }

            if (!endDate) {
                endDate =
                    `${lastDay.getFullYear()}-` +
                    `${pad(lastDay.getMonth() + 1)}-` +
                    `${pad(lastDay.getDate())}`;
            }
        }

        /* -------------------------
           CREATE DATE OBJECTS
        ------------------------- */
        const start = new Date(
            `${startDate}T00:00:00${IST}`
        );

        const end = new Date(
            `${endDate}T23:59:59.999${IST}`
        );

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format"
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be greater than end date"
            });
        }

        /* -------------------------
           FETCH INVOICES
        ------------------------- */
        const invoices = await InvoiceModel
            .find(
                {
                    userId,
                    invoiceDate: {
                        $gte: start,
                        $lte: end
                    }
                },
                {
                    invoiceNumber: 1,
                    customerId: 1,
                    totalAmount: 1,
                    invoiceDate: 1,
                    "cgst.amount": 1,
                    "sgst.amount": 1,
                    "igst.amount": 1
                }
            )
            .populate({
                path: "customerId",
                select: "clientName email"
            })
            .sort({
                invoiceDate: -1,
                createdAt: -1
            })
            .lean();

        return res.status(200).json({
            success: true,
            invoices,
            total: invoices.length
        });

    } catch (error) {
        console.error(
            "GET INVOICES BY DATE RANGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   EXPORT CONTROLLERS
========================================================= */
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