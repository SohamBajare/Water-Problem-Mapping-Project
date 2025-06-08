const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    username : {
        type : String,
    },
    passKey : {
        type : String,
    },
    email: {
        type: String, 
        required: true
    }
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;


  