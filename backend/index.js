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


const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/user', UserRouter)
app.use('/company', CompanyRouter)
app.use('/client', ClientRouter)
app.use('/invoice', InvoiceRouter)
app.use('/proforma', ProformaRouter)
app.use('/api/google', GoogleOauthRouter)
app.listen(3000,()=>{
    console.log("Working at port: http://localhost:3000")
})