const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String
    },
    password: String,
    thutu: Number,
    roles: String
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;