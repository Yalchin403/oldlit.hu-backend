const express = require('express');
const router = express.Router();
import { UserController } from '../controllers/user';


router.get('/', UserController.all);
router.post('/', UserController.create);
router.get('/:userID/', UserController.get);
router.patch('/confirm-email/:token/', UserController.confirmEmail);
router.put('/:userID/', UserController.authenticateToken, UserController.update);
router.delete('/:userID/', UserController.authenticateToken, UserController.destroy);
router.post('/login/', UserController.login);
router.post('/forgot-password/', UserController.forgotPassword);
router.patch('/change-password/:forgotPassToken/', UserController.changePassword);
router.post('/change-email/', UserController.authenticateToken, UserController.changeEmail);
router.patch('/confirm-change-email/:changeEmailToken/', UserController.confirmChangeEmail);
router.post('/request-reconfirm-email/', UserController.requestReconfirmEmail);
router.get('/profile/me/', UserController.authenticateToken, UserController.getProfile);

module.exports = router;