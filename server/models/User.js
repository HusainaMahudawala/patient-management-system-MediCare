const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        trim: true,
        default: ""
    },

    age: {
        type: Number,
        min: 0,
        max: 120,
        default: null
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say", ""],
        default: ""
    },

    bloodGroup: {
        type: String,
        enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        default: ""
    },

    address: {
        type: String,
        trim: true,
        default: ""
    },

    emergencyContact: {
        type: String,
        trim: true,
        default: ""
    },

    profileImage: {
        type: String,
        default: ""
    }

});

module.exports = mongoose.model("User", userSchema);