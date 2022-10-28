const express = require('express');
const router = express.Router();
import * as dotenv from 'dotenv'
import { AppDataSource } from '../data-source'
import {User} from '../entity/User'
import {isEmail} from '../utils/user'
import * as bcrypt from 'bcryptjs'


dotenv.config();
//  @route GET /
// @desc redirect to original Url

router.get('/', async (req, res) => {
        try {
            const users = await AppDataSource.manager.find(User)
            return res.status(200).json(users);
            } catch (err) {
            console.error(err);
            res.status(500).json("Internal server error");
            }
        }
)


router.post('/',async (req, res) => {
    try {
        const { firstName } = req.body;
        const { lastName } = req.body;
        const {age} = req.body;
        const { email } = req.body;
        const { password1 } = req.body;
        const { password2 } = req.body;

        if(firstName != "" && lastName != "" && age != "" && email != "" && password1 != "" && password2 != ""){

            if(password1 == password2){

                if(isEmail(email)) {

                    // check if we already have the email address

                    let encrptedPass = bcrypt.hashSync(password1, bcrypt.genSaltSync());

                    let userObj = new User();
                    userObj.firstName = firstName;
                    userObj.lastName = lastName;
                    userObj.age = parseInt(age);
                    userObj.email = email;
                    userObj.dateJoined = new Date();
                    userObj.isEmailVerified = false;
                    userObj.isSuperUser = false;
                    userObj.password = encrptedPass;

                    await AppDataSource.manager.save(userObj);
                    
                    let serializedUserObj = await AppDataSource.manager.findOneBy(User, {
                        id: userObj.id,
                    })
                    res.status(201).json(serializedUserObj);

                } else {
                    res.status(403).json({"error": "email is not valid"});
                }
            } else {
                res.status(403).json({"error":"password do not match"});
            }
        }
        

        


    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
})

module.exports = router;
