const express = require('express');
const router = express.Router();
import * as dotenv from 'dotenv'
import { AppDataSource } from '../data-source'
import { Book } from '../entity/Book'


dotenv.config();
//  @route GET /
// @desc redirect to original Url

router.get('/', async (req, res) => {
        try {
                
            let books = AppDataSource.manager.find(Book, {
                where: {
                    isVerified: true
                }
            });

            res.json(books);
        } catch (err) {
            console.error(err);
            res.status(500).json("Internal server error");
        }
})


router.post('/', async (req, res) => {
    try {
        
    } catch(err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
})
module.exports = router;
