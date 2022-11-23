const express = require('express');

const router = express.Router();

const home = require('../controllers/home')

router.get('/books/fetch', home.getBooks);
router.get('/books/search', home.getBooksSearch)
router.get('/books/the-loai/:id', home.getBooksOfType)
router.get('/books/:id/incrementView', home.incrementView)
router.get('/books/:id/incrementDownload', home.incrementDownload)

module.exports = router