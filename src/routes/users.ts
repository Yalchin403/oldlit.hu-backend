const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
import * as dotenv from 'dotenv';
import { UserController } from '../controllers/user';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import sendEmail from '../queues/email';
import {
    isPassMatch,
    isEmail,
    isDataEmpty,
    isEmailTaken,
} from '../utils/user';
const jwt = require('jsonwebtoken');


dotenv.config();
const SECRET_KEY_JWT: string = process.env.SECRET_KEY_JWT;
let baseURL: string;

if (process.env.PROJ_ENV === "dev") {
    baseURL = process.env.LOCAL_DOMAIN;
} else {
    baseURL = process.env.PROD_DOMAIN;
}


router.get('/', UserController.all);
router.post('/', UserController.create);
router.get('/:userID/', UserController.get);
router.get('/confirm-email/:token/', UserController.confirmEmail);
router.put('/:userID/', UserController.update);
router.delete('/userID/', UserController.destroy);
router.post('/login/', UserController.login);
router.get('/forgot-password/', UserController.forgotPassword);
router.patch("/change-password/:forgotPassToken", UserController.changePassword);




module.exports = router;