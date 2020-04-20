const mongoose = require("mongoose")

const user = new mongoose.Schema({
    name: {
        type: String,
        min: 3,
        max: 100,
        required: true
    },
    email: {
        type: String,
        min: 3,
        max: 100,
        required: true
    },
    password: {
        type: String,
        min: 6,
        max: 1024,
        required: true
    },
    token: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {
            expires: "1d"
        },
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model("user", user)

module.exports = User