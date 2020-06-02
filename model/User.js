const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userschema = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    continent: [{
        continent_name: {
            type: String,
            trim: true
        },
        blog: {
            data: [{
                type: String
            }],
            country: {
                type: String,
            },
            title: {
                type: String
            },
            category: [{
                type: String
            }],
            description: {
                type: String
            },
            content: {
                type: String
            }
        }
    }]
});


module.exports = mongoose.model('User', userschema);