const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userschema = mongoose.Schema({
    first_name: {
        type: String,
        trim: true
    },
    last_name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    ProfilePic: String,
    secretToken: String,
    active: {
        type: Boolean
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
            date: {
                type: String,
            },
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