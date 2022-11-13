const express = require('express');
const router = express.Router();
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { Book } from '../entity/Book';
import { BookController } from "../controllers/index";

dotenv.config();

router.get('/books/', BookController.getAll);

router.post('/books/', BookController.create);

module.exports = router;