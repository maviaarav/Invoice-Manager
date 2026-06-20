const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
    required: true
  },

  invoiceNumber: {
    type: String,
    unique: true
  },

  financialYear: String,

  invoiceDate: {
    type: Date,
    default: Date.now
  },


  items: [
    {
      name: String,


      quantity: {
        type: Number,
        default: null
      },


      rate: {
        type: Number,
        default: null
      },


      amount: {
        type: Number,
        required: true
      },
      isTaxable: {
        type: Boolean,
        default: false
      }

    }
  ],

  subtotal: {
    type: Number,
    required: true
  },

  cgst: {
    rate: Number,   
    amount: Number 
  },

  igst: {
    rate: Number,
    amount: Number
  },



  totalAmount: {
    type: Number,
    required: true
  },

}, { timestamps: true })

const invoiceModel = mongoose.model('invoices', invoiceSchema);

module.exports = invoiceModel;