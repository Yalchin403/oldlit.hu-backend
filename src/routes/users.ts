const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
import * as dotenv from 'dotenv'
import { AppDataSource } from '../data-source'
import {User} from '../entity/User'
import sendEmail from '../queues/email';
import {
    isPassMatch,
    isEmail,
    isDataEmpty,
    isEmailTaken,
} from '../utils/user'
const jwt = require('jsonwebtoken');


dotenv.config();
const SECRET_KEY_JWT: string = process.env.SECRET_KEY_JWT;
let baseURL: string;

if(process.env.PROJ_ENV === "dev"){
    baseURL = process.env.LOCAL_DOMAIN;
} else {
    baseURL = process.env.PROD_DOMAIN;
}


router.get('/', async (req, res) => {
        try {
            
            //TODO:
            //  check if user requesting to this endpoint is authenticated and superuser

            const users = await AppDataSource.manager.find(User);

            return res.status(200).json(users);

            } catch (err) {
            console.error(err);
            res.status(500).json("Internal server error");
            }
        }
)


router.get('/:userID/', async (req, res) => {
    try {

        //TODO:
        //  check if requested user is authenticated and superuser

        const user = await AppDataSource.manager.findBy(User, {
            id: req.params.usedID,
        })
        return res.status(200).json(user);
        } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
        }
    }
)


router.post('/',async (req, res) => {
    try {

        if(!isDataEmpty(req.body)){
            const {firstName} = req.body;
            const {lastName} = req.body;
            let {email} = req.body;
            const {password1} = req.body;
            const {password2} = req.body;
            email = email.toLowerCase();

            if(isPassMatch(password1, password2)){

                if(isEmail(email)) {
                    let emailTaken = await isEmailTaken(email);

                    if(!emailTaken){
                        let encrptedPass = bcrypt.hashSync(password1, bcrypt.genSaltSync());
                        let userObj = new User();
                        userObj.firstName = firstName;
                        userObj.lastName = lastName;
                        userObj.email = email;
                        userObj.dateJoined = new Date();
                        userObj.isEmailVerified = false;
                        userObj.isSuperUser = false;
                        userObj.password = encrptedPass;

                        // save user to db
                        await AppDataSource.manager.save(userObj);
                        
                        let serializedUserObj = await AppDataSource.manager.findOneBy(User, {
                            id: userObj.id,
                        })

                        //  send email verification
                        let payload = {
                            userID: userObj.id
                        };                
                        let token = jwt.sign(payload, SECRET_KEY_JWT, { expiresIn: '1d' });
                        let verifyLink: string = `${baseURL}/users/confirm-email/${token}`;

                        sendEmail({
                            "email": email,
                            "firstName": firstName,
                            "verifyLink": verifyLink
                        })

                        res.status(201).json(serializedUserObj);

                    }

                    else {
                        res.status(409).json({"error":"email is already taken"});
                    }

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

router.get('/confirm-email/:token/', async (req, res) => {
    try {
        let token = req.params.token;
        let payload = jwt.verify(token, SECRET_KEY_JWT);
        let { userID } = payload;
        await AppDataSource.createQueryBuilder()
        .update(User)
        .set({
            isEmailVerified: true
        })
        .where(
            "id = :id", { id: userID }
        )
        .execute()

        res.json({"sucess": "verified"})
    } catch (err) {
        console.log(err);
    }
})
module.exports = router;
