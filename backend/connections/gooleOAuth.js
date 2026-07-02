const { google } = require('googleapis') 
const dotenv = require('dotenv')
dotenv.config()

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/google/callback'
)

module.exports = oauth2Client