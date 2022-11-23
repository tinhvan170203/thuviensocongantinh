const express = require('express');

const router = express.Router();

const multer = require('multer')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload')
    },
    filename: function(req, file, cb) {
        cb(null, +new Date() + '_' + file.originalname)
    }
})
var upload = multer({
    storage: storage,
});

const middlewareController = require('../middlewares/verifyToken');

const book = require('../controllers/book');

router.get('/book/the-loai/fetch', book.getLoaisachList);
router.get('/book/fetch',middlewareController.verifyToken, book.getBooks)
router.post('/book/add',middlewareController.verifyToken, upload.fields([{name: 'file'},{name: "img"}]), book.addBook)
router.put('/book/edit/:id',middlewareController.verifyToken, upload.fields([{name: 'fileEdit'},{name: "imgEdit"}]), book.editBook)
router.delete('/book/delete/:id',middlewareController.verifyToken, book.deleteBook)

router.get('/book/thong-ke/total-sach',middlewareController.verifyToken, book.thongkeTotalSach)
router.get('/book/thong-ke/views',middlewareController.verifyToken, book.thongkeViews)
router.get('/book/thong-ke/downloads',middlewareController.verifyToken, book.thongkeDownloads)



module.exports = router