const express = require('express');
const router = express.Router();
import { BookController } from "../controllers/index";
import { UserController } from '../controllers/user';


router.get('/books/', BookController.getAll);
router.get('/books/me/', UserController.authenticateToken ,BookController.getMyBooks);
router.get('/books/:bookID/', BookController.get);
router.post('/books/', UserController.authenticateToken, BookController.create);
router.put('/books/:bookID', UserController.authenticateToken, BookController.update);
router.delete('/books/:bookID', UserController.authenticateToken, BookController.delete);
router.put('/books/sold/:bookID', UserController.authenticateToken, BookController.sold);
router.post('/books/upload/', UserController.authenticateToken, BookController.upload);


module.exports = router;