const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requred: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
    type: String,
    required: function () {
        return this.provider !== "google";
    }
},
provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
},
    googleId: {
        type: String,
        default: null
    },
    profilePicture: {
        type: String,
        default: null
    },
    gmailConnected: {
        type: Boolean,
        default: false
    },
    gmailRefreshToken: {
        type: String,
        default: null
    }
},{timestamps: true})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel

