const { google } = require('googleapis');
const oauth2Client = require('../connections/gooleOAuth.js');
const dotenv = require('dotenv');
const userModel = require('../models/user');
const fs = require('fs');
const path = require('path');

dotenv.config();

const TEMPLATE_PATH = path.join(
    process.cwd(),
    'controllers',
    'template.html'
);

const RAW_TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8');

const buildHtml = (fields) => {
    let html = RAW_TEMPLATE;

    for (const [key, value] of Object.entries(fields)) {
        const replacement = value ?? '';

        html = html
            .split(`{{${key}}}`)
            .join(replacement);

        html = html
            .split(`${key}`)
            .join(replacement);
    }

    return html;
};

/**
 * Creates a MIME email and encodes it for Gmail API.
 */
const createRawEmail = ({
    from,
    to,
    subject,
    html,
    filename,
    pdfBuffer,
}) => {
    const boundary = `----=_Boundary_${Date.now()}`;

    const pdfBase64 = pdfBuffer.toString('base64');

    const email = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        `Content-Type: text/html; charset="UTF-8"`,
        `Content-Transfer-Encoding: 8bit`,
        '',
        html,
        '',
        `--${boundary}`,
        `Content-Type: application/pdf; name="${filename}"`,
        `Content-Disposition: attachment; filename="${filename}"`,
        `Content-Transfer-Encoding: base64`,
        '',
        pdfBase64,
        '',
        `--${boundary}--`,
    ].join('\r\n');

    return Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Creates an authenticated Gmail API client
 * using the user's stored refresh token.
 */
const getGmailClient = async (user) => {
    oauth2Client.setCredentials({
        refresh_token: user.gmailRefreshToken,
    });

    // Refresh/get access token
    await oauth2Client.getAccessToken();

    return google.gmail({
        version: 'v1',
        auth: oauth2Client,
    });
};

const createTransport = async (req, res) => {
    try {
        const user = await userModel.findById(
            req.user.userId || req.user._id
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        if (!user.gmailRefreshToken) {
            return res.status(400).json({
                message: 'Please connect your Google account first.',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Invoice PDF attachment is missing.',
            });
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
            return res.status(400).json({
                message: 'At least one recipient email is required.',
            });
        }

        const recipientList = emails
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean);

        if (recipientList.length === 0) {
            return res.status(400).json({
                message: 'At least one valid recipient email is required.',
            });
        }

        const formattedInvoiceDate = new Date(
            invoiceDate
        ).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });

        console.log('paymentUrl:', paymentUrl);
        console.log('qrCodeUrl:', qrCodeUrl);

        const htmlTemplate = buildHtml({
            company_name: companyName,
            client_name: clientName,
            invoice_number: invoiceNumber,
            issue_date: formattedInvoiceDate,
            total_amount: `₹${totalAmount}`,
            payment_url: paymentUrl,
            qr_code_url: qrCodeUrl,
        });

        const gmail = await getGmailClient(user);

        const filename = `Invoice_${invoiceNumber}.pdf`;

        const rawEmail = createRawEmail({
            from: user.email,
            to: recipientList.join(', '),
            subject: `Submission of Invoice ${invoiceNumber}`,
            html: htmlTemplate,
            filename,
            pdfBuffer: req.file.buffer,
        });

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawEmail,
            },
        });

        console.log(
            'Gmail message sent:',
            response.data.id
        );

        return res.status(200).json({
            message: 'Email sent successfully',
            messageId: response.data.id,
        });

    } catch (error) {
        console.error(
            'Gmail API email error:',
            error.response?.data || error
        );

        return res.status(500).json({
            message:
                error.response?.data?.error?.message ||
                error.message ||
                'Failed to send email',
        });
    }
};

module.exports = {
    createTransport,
};