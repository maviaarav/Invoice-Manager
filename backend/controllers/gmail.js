const oauth2Client = require('../connections/gooleOAuth.js');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const userModel = require('../models/user');
const fs = require('fs');
const path = require('path');

dotenv.config();

const TEMPLATE_PATH = path.join(process.cwd(), 'controllers', 'template.html');
const RAW_TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8');

const transporterCache = new Map();

const buildHtml = (fields) => {
    let html = RAW_TEMPLATE;
    for (const [key, value] of Object.entries(fields)) {
        html = html.split(`${key}`).join(value ?? '');
    }
    return html;
};

const getTransporter = async (user) => {
    const userId = user._id.toString();
    const cached = transporterCache.get(userId);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
        return cached.transporter;
    }

    oauth2Client.setCredentials({ refresh_token: user.gmailRefreshToken });
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: user.email,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: user.gmailRefreshToken,
            accessToken: accessToken.token,
        },
    });

    transporterCache.set(userId, {
        transporter,
        expiresAt: now + 50 * 60 * 1000, // 50 minutes
    });

    return transporter;
};

const createTransport = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId || req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.gmailRefreshToken) {
            return res.status(400).json({ message: 'Please connect your Google account first.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Invoice PDF attachment is missing.' });
        }

        const {
            companyName,
            clientName,
            invoiceNumber,
            invoiceDate,
            totalAmount,
            emails,
            paymentUrl,
            qrCodeUrl,
        } = req.body;

        if (!emails) {
            return res.status(400).json({ message: 'At least one recipient email is required.' });
        }

        const recipientList = emails
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean);

        if (recipientList.length === 0) {
            return res.status(400).json({ message: 'At least one valid recipient email is required.' });
        }
const formattedInvoiceDate = new Date(invoiceDate).toLocaleDateString(
    "en-GB",
    {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }
);

        const htmlTemplate = buildHtml({
            company_name: companyName,
            client_name: clientName,
            invoice_number: invoiceNumber,
            issue_date: formattedInvoiceDate,
            total_amount: `₹${totalAmount}`,
            payment_url: paymentUrl,
            qr_code_url: qrCodeUrl,
        });

        const transport = await getTransporter(user);

        await transport.sendMail({
            from: user.email,
            to: recipientList.join(','),
            subject: `Submission of Invoice ${invoiceNumber}`,
            html: htmlTemplate,
            attachments: [
                {
                    filename: `Invoice_${invoiceNumber}.pdf`,
                    content: req.file.buffer,
                },
            ],
        });

        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        const uid = (req.user?.userId || req.user?._id)?.toString();
        if (uid) transporterCache.delete(uid);

        console.error(error);
        return res.status(500).json({ message: error.message || 'Failed to send email' });
    }
};

module.exports = {
    createTransport,
};