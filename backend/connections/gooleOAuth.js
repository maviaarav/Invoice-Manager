const { google } = require('googleapis') 
const dotenv = require('dotenv')
dotenv.config()

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://maviaarav-invoice-api-d7aqcgd7gaagh7eg.centralindia-01.azurewebsites.net/api/google/callback'
)

module.exports = oauth2Client