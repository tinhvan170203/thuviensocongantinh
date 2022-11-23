const express = require('express');

const router = express.Router();

const auth = require('../controllers/auth');
const middlewareController = require('../middlewares/verifyToken');

router.post('/login', auth.login )
router.get('/logout', middlewareController.verifyToken, auth.logout)
router.get('/users/fetch',middlewareController.verifyToken, auth.getUserList)
router.get('/requestRefreshToken', auth.requestRefreshToken)
router.post('/users/add', middlewareController.verifyToken, auth.addUser)
router.delete('/users/delete/:id', middlewareController.verifyToken, auth.deleteUser)
router.put('/users/edit/:id', middlewareController.verifyToken, auth.editUser)

module.exports = router