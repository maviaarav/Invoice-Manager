const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },

    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true
    },

    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"clients",
        required:true
    },

    invoiceNumber:{
        type:String,
        unique:true
    },

    financialYear:{
        type:String
    },

    invoiceDate:{
        type:Date,
        default:Date.now
    },
    shippingAddress:{
        type:String,
        default:""
    },
    billingAddress:{
        type:String,
        default:""
    },
    placeOfSupply:{
        type:String,
        required:true
    },

    items:[
        {
            Name:{
                type:String,
                required:true
            },

            quantity:{
                type:Number,
                default:null
            },

            rate:{
                type:Number,
                default:null
            },

            amount:{
                type:Number,
                required:true
            },
            HSNCode:{
                type:String,
                required:true
            },
            isTaxable:{
                type:Boolean,
                default:false
            }
        }
    ],

    subtotal:{
        type:Number,
        required:true
    },

    taxType:{
        type:String,
        enum:["CGST_SGST","IGST","NONE"],
        default:"NONE"
    },

    cgst:{
        rate:{
            type:Number,
            default:0
        },
        amount:{
            type:Number,
            default:0
        }
    },

    sgst:{
        rate:{
            type:Number,
            default:0
        },
        amount:{
            type:Number,
            default:0
        }
    },

    igst:{
        rate:{
            type:Number,
            default:0
        },
        amount:{
            type:Number,
            default:0
        }
    },

    totalTax:{
        type:Number,
        default:0
    },

    totalAmount:{
        type:Number,
        required:true
    }

},
{timestamps:true}
);



const InvoiceModel = mongoose.model("invoices", invoiceSchema);

module.exports = InvoiceModel;