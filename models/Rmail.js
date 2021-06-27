const mongoose = require('mongoose')

const RmailSchema = new mongoose.Schema({
    from:{
        type: String,
        required: true,
    },
    to:{
        type: String,
        required: true,
    },
    cc:{
        type: String,
        required: false,
    },
    subject:{
        type: String,
        required: true,
    },
    body:{
        type: String,
    },
    scheduler:{
        type: String,
        default: 'recurring',
        enum: ['recurring', 'weekly', 'monthly', 'yearly']
    },
    schedulerDateTime:{
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Rmail', RmailSchema)