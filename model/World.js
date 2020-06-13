const mongoose = require('mongoose');

const worldschema = mongoose.Schema({
    continent: String,
    country: [{
        type: String
    }]
});

module.exports = mongoose.model('World', worldschema);