const express = require('express');
const router = express.Router();
import * as dotenv from 'dotenv';
import { BookController } from "../controllers/index";
import { UserController } from '../controllers/user';


dotenv.config();

router.get('/books/', BookController.getAll);
router.get('/books/me/', UserController.authenticateToken ,BookController.getMyBooks);
router.get('/books/:bookID', BookController.get);
router.post('/books/', BookController.create);

module.exports = router;