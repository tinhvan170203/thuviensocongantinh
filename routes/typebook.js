const express = require('express');

const router = express.Router();

const typebook = require('../controllers/typebook')
const middlewareController = require('../middlewares/verifyToken');

router.get('/typebook/fetch',middlewareController.verifyToken, typebook.getLoaisachList)
router.post('/typebook/add',middlewareController.verifyToken, typebook.addLoaisach)
router.delete('/typebook/delete/:id',middlewareController.verifyToken, typebook.deleteLoaisach)
router.put('/typebook/edit/:id',middlewareController.verifyToken, typebook.editLoaisach)

module.exports = router