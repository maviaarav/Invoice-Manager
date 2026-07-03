const  oauth2Client =  require('../connections/gooleOAuth.js')
const userModel = require('../models/user')
const jwt = require('jsonwebtoken');
const { google } = require('googleapis')

const connectGoogle = async (req,res) =>{
    try{
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            "openid",
            "email",
            "profile",
          'https://mail.google.com/',
        ],
      
      })
      return res.redirect(authUrl)
    
    }catch(error){
        res.status(500).json({message: "Unable to connect to Google"})
        console.log(error)
    }
}
const googleCallback = async (req,res) =>{
        console.log("========== CALLBACK ==========");
    console.log("Time:", new Date().toISOString());
    console.log("Code:", req.query.code);
    try{
        const { code } = req.query;
        if(!code ){
            return res.status(400).json({message: "Invalid request"})
        }
        const { tokens } = await oauth2Client.getToken(code);
        if(!tokens ){
            return res.status(400).json({message: "Failed to get access token"})
        }

        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        })
 const { data } = await oauth2.userinfo.get();

let user = await userModel.findOne({
    email: data.email
});

if (!user) {
    user = await userModel.create({
        name: data.name,
        email: data.email,
        provider: "google",
        profilePicture: data.picture,
        googleId: data.id,
        gmailConnected: true,
        gmailRefreshToken: tokens.refresh_token || null
    });
    console.log("Created user:", user);
} else {
    user.name = data.name;
    user.profilePicture = data.picture;
    user.googleId = data.id;
    user.gmailConnected = true;

    if (tokens.refresh_token) {
        user.gmailRefreshToken = tokens.refresh_token;
    }

    await user.save();
}
        const token = jwt.sign({
            userId: user._id
        }, process.env.secretKey, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.redirect('http://localhost:5173/')
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Connection failed"})
    }
}
module.exports = {
    connectGoogle,
    googleCallback
}