const express = require('express');
const router = express.Router();
import * as dotenv from 'dotenv'
import { AppDataSource } from '../data-source'
import { Review } from '../entity/Review';


dotenv.config();
//  @route GET /
// @desc redirect to original Url

router.get('/', async (req, res) => {
    try {

        // we will actually never need it
        const reviewModel = AppDataSource.getRepository(Review)
        const reviews = await reviewModel.find()
        return res.status(200).json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
});

module.exports = router;
