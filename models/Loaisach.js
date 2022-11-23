const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const loaisachSchema = new Schema({
    tenloaisach: {
        type: String
    },
    mota: String,
    thutu: Number
});

const Loaisachs = mongoose.model('Loaisach', loaisachSchema);

module.exports = Loaisachs;