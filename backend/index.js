require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage
});
const { restrictToLogin } = require('./middlewares/auth')
const { getCompany }  = require('./controllers/company')
const UserRouter = require('./routes/user')
const CompanyRouter = require('./routes/company')
const ClientRouter = require('./routes/client')
const mongoose = require('./connections/server')
const InvoiceRouter = require('./routes/invoice')
const ProformaRouter = require('./routes/proforma')
const GoogleOauthRouter = require('./routes/googleOauth')
const GmailRouter = require('./routes/gmail')
const PORT = process.env.PORT || 3000;

const app = express()
const allowedOrigins = [
    "https://invoizor.me"
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
console.log("=== APP STARTING ===");
console.log("PORT =", process.env.PORT);
console.log("MONGO_URI exists =", !!process.env.MONGO_URI);
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.get('/',(req,res)=>{
    res.send("Hello World")
})

app.use('/user', UserRouter)
app.use('/company', CompanyRouter)
app.use('/client', ClientRouter)
app.use('/invoice', InvoiceRouter)
app.use('/proforma', ProformaRouter)
app.use('/api/google', GoogleOauthRouter)
app.use('/api/gmail', restrictToLogin, GmailRouter)
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})