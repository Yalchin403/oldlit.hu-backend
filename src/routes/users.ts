const express = require('express');
const router = express.Router();
import { UserController } from '../controllers/user';


/**
   * @openapi
   
   *  get:
   *     tags:
   *     - Users
   *     description: See all the users
   *     responses:
   *       200:
   *         description: Getting all users successfully
   */
router.get('/', UserController.all);
router.post('/', UserController.create);
router.get('/:userID/', UserController.get);
router.patch('/confirm-email/:token/', UserController.confirmEmail);
router.put('/:userID/', UserController.authenticateToken, UserController.update);
router.delete('/:userID/', UserController.authenticateToken, UserController.destroy);
router.post('/login/', UserController.login);
router.get('/forgot-password/', UserController.forgotPassword);
router.patch('/change-password/:forgotPassToken/', UserController.changePassword);
router.patch('/change-email/', UserController.authenticateToken, UserController.changeEmail);
router.patch('confirm-change-email/:changeEmailToken/', UserController.confirmChangeEmail);
router.get('/request-reconfirm-email', UserController.requestReconfirmEmail);
router.patch('/reconfirm-email/:reconfirmToken', UserController.reconfirmEmail);

module.exports = router;