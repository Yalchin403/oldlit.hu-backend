const express = require('express');
const router = express.Router();
import { UserController } from '../controllers/user';


router.get('/', UserController.all);
router.post('/', UserController.create);
router.get('/:userID/', UserController.get);
router.get('/confirm-email/:token/', UserController.confirmEmail);
router.put('/:userID/', UserController.authenticateToken, UserController.update);
router.delete('/:userID/',UserController.authenticateToken, UserController.destroy);
router.post('/login/', UserController.login);
router.patch('/forgot-password/', UserController.forgotPassword);
router.patch('/change-password/:forgotPassToken/', UserController.changePassword);


module.exports = router;