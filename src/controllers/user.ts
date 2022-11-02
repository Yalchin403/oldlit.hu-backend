import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
const express = require('express');
const bcrypt = require('bcryptjs');
import * as dotenv from 'dotenv';
import sendEmail from '../queues/email';
import {
    isPassMatch,
    isEmail,
    isDataEmpty,
    isEmailTaken,
    generateAccessToken,
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


export class UserController {
    static async all(req: Request, res: Response) {
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


    static async get(req: Request, res: Response) {
        try {

            //TODO:
            //  check if requested user is authenticated and superuser

            let userID: number = parseInt(req.params.userID);
            const user = await AppDataSource.manager.findBy(User, {
                id: userID,
            });
            return res.status(200).json(user);
        } catch (err) {
            console.error(err);
            return res.status(500).json("Internal server error");
        }
    }


    static async create(req: Request, res: Response) {
        try {

            if (!isDataEmpty(req.body)) {
                const { firstName } = req.body;
                const { lastName } = req.body;
                let { email } = req.body;
                const { password1 } = req.body;
                const { password2 } = req.body;
                email = email.toLowerCase();

                if (isPassMatch(password1, password2)) {

                    if (isEmail(email)) {
                        let emailTaken = await isEmailTaken(email);

                        if (!emailTaken) {
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
                            });

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
                            });

                            res.status(201).json(serializedUserObj);

                        }

                        else {
                            res.status(409).json({ "error": "email is already taken" });
                        }

                    } else {
                        res.status(403).json({ "error": "email is not valid" });
                    }
                } else {
                    res.status(403).json({ "error": "password do not match" });
                }
            }

        } catch (err) {
            console.error(err);
            res.status(500).json("Internal server error");
        }
    }

    static async update(req: Request, res: Response) {

    }

    static async destroy(req: Request, res: Response) {

    }

    static async confirmEmail(req: Request, res: Response) {
        try {
            //TODO
            //  play around this function for edge cases

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
                .execute();

            res.json({ "sucess": "verified" });
        } catch (err) {
            console.log(err);
        }
    }

    static async login(req: Request, res: Response) {
        if (!isDataEmpty(req.body)) {
            let { email } = req.body;
            const { password } = req.body;
            email = email.toLowerCase();

            // get user from db
            const userObj = await AppDataSource.getRepository(User).findOne({
                where: { email: email },
                select: ["password", "id", "isEmailVerified"],

            });
            console.log(userObj);
            if (userObj !== null) {

                if (userObj.isEmailVerified) {
                    const isPassCorrect = bcrypt.compareSync(password, userObj.password);
                    if (isPassCorrect) {
                        // Send JWT
                        const access_token = generateAccessToken(userObj.id);
                        console.log(access_token);
                        return res.json({ "access_token": access_token });
                    }
                    else {
                        // response is OutgoingMessage object that server response http request
                        return res.json({ error: 'passwords do not match' });
                    }

                }

                else {
                    return res.status(401).json({ "error": "account not verified" });
                }
            }

            else {
                return res.status(404).json({ "error": "user not found" });
            }
        }
    }

    static async logout(req: Request, res: Response) {
        // get the current token
        // invalidate it
    }

    static async forgotPassword(req: Request, res: Response) {
        // generate token by user id
        // send to the email
        // have another end point to change password with the token
    }

    static async forgotPasswordHandler(req: Request, res: Response) {
        // get 2 passwords
        // compare, check if matches
        // save
    }

    static async authenticateToken(req: Request, res: Response, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.sendStatus(401);

        jwt.verify(token, process.env.SECRET_KEY_JWT as string, (err: any, user: any) => {
            console.log(err);

            if (err) return res.sendStatus(403);

            req["user"] = user;

            next();
        });
    }
}
