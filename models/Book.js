const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    tensach: {
        type: String
    },
    trichyeu: String,
    tacgia: String,
    nhaxuatban: String,
    imgUrl: String,
    img_public_id: String,
    theloai: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loaisach"
    },
    theloaiString: String,
    url: String,
    public_id: String,
    thutu: Number,
    show: Boolean,
    views: {
        type:Number, default: 0},
    downloads: {
        type:Number, default: 0}
},{ timestamps: true });


const Books = mongoose.model('Book', bookSchema);

module.exports = Books;