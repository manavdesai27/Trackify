const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    currentPrice :{
        type: Number,
        required: true,
    },
    reqPrice :{
        type: Number,
        required: true,
    },
    notification: {
        type: Boolean,
        required: true,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    }
});

module.exports = mongoose.model("Tracks", trackSchema);