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
import e = require("express");
import { json } from "stream/consumers";
const jwt = require('jsonwebtoken');


dotenv.config();
const SECRET_KEY_JWT: string = process.env.SECRET_KEY_JWT;
let baseURL: string;

if (process.env.PROJ_ENV === "dev") {
    baseURL = process.env.LOCAL_DOMAIN;
} else {
    baseURL = process.env.PROD_DOMAIN;
}
const LoginExp: string = "1800s";
const EmailConfirmExp: string = "1d";
const ForgotPassExp: string = "1d";



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
                            let token = generateAccessToken(payload, '1d');
                            let verifyLink: string = `${baseURL}/users/confirm-email/${token}`;

                            let emailSubject: string = "Verify your email";
                            let emailContentHTML: string = `
                                Hello, <b>${firstName}</b>,<br>
                                <br>Welcome to our website!<br>
                                Please visit the below link to verify your account.<br><br>

                                ${verifyLink}

                                <br><br>

                                Thanks for joining!`;

                            sendEmail({
                                "email": email,
                                "emailSubject": emailSubject,
                                "emailContentHTML": emailContentHTML
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

    // only for authenticated users
    static async update(req: Request, res: Response) {
        if (!isDataEmpty(req.body)) {
            const { userID } = req.params;
            const userObj = await AppDataSource.manager.findOneBy(User, {
                id: +userID
            });

            if (userObj == null) {
                return res.status(404).json({ "error": "user not found" });
            }

            const requestedUserID = req["user"].id;

            if (+userID === requestedUserID) {
                const { firstName } = req.body;
                const { lastName } = req.body;

                if (req.body.hasOwnProperty("firstName")) {
                    userObj.firstName = firstName;
                }

                if (req.body.hasOwnProperty("lastName")) {
                    userObj.lastName = lastName;
                }

                await AppDataSource.manager.save(userObj);

                return res.status(200).json({ "success": "updated" });

            }

            else {
                return res.status(403).json({ "error": "forbidden" });
            }
        }

        else {
            return res.status(422).json({ "error": "request body cannot be empty" });
        }
    }

    // only superusers
    static async destroy(req: Request, res: Response) {
        const { userID } = req.params;
        const userObj = await AppDataSource.manager.findOneBy(User, {
            id: +userID
        });
        const requestedUserID = req["user"].id;
        const requestedUserObj = await AppDataSource.getRepository(User).findOne({
            where: { id: requestedUserID },
            select: ["isSuperUser"],
        });

        if (requestedUserObj !== null) {

            if (requestedUserObj.isSuperUser) {

                if (userObj !== null) {
                    await AppDataSource.getRepository(User).remove(userObj);
                    return res.status(204).json({ "success": "deleted" });

                }

                else {
                    return res.status(404).json({ "error": "user not found" });
                }
            }

            else {
                return res.status(403).json({ "error": "unauthorized attempt" });
            }
        }

        else {
            return res.status(404).json({ "error": "user not found" });
        }
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

            if (userObj !== null) {

                if (userObj.isEmailVerified) {
                    const isPassCorrect = bcrypt.compareSync(password, userObj.password);
                    if (isPassCorrect) {
                        // Send JWT
                        const payload = {
                            id: userObj.id
                        };
                        const access_token = generateAccessToken(payload, LoginExp);
                        return res.json({ "access_token": access_token });
                    }
                    else {
                        return res.json({ error: 'email or password is incorrect' });
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

    static async forgotPassword(req: Request, res: Response) {
        // generate token by user id
        // send to the email
        // have another end point to change password with the token
        let { email } = req.body;
        email = email.toLowerCase();
        console.log(email);
        const userObj = await AppDataSource.manager.findOneBy(User, {
            email: email
        });


        if (userObj !== null) {
            let payload = { id: userObj.id };
            let token: string = generateAccessToken(payload, ForgotPassExp);
            let changePassLink: string = `${baseURL}/api/users/change-password/${token}/`;
            let emailSubject = "Change your password";
            let emailContentHTML = `As per your request, you can visit the link below to change your password:
                ${changePassLink}
                `;
            sendEmail({
                "email": email,
                "emailSubject": emailSubject,
                "emailContentHTML": emailContentHTML
            });

            return res.status(202).json({ "success": "email sent" });  // The request has been accepted for processing, but the processing has not been completed
        }

        else {
            return res.status(404).json({ "error": "account not found" });
        }


    }

    static async changePassword(req: Request, res: Response) {
        try {
            if (!isDataEmpty(req.body)) {
                const { password1 } = req.body;
                const { password2 } = req.body;
                console.log(password1, password2);
                const forgotPassToken = req.params.forgotPassToken;
                let payload = jwt.verify(forgotPassToken, SECRET_KEY_JWT);
                let { userID } = payload;
                let userObj = await AppDataSource.manager.findOneBy(User, {
                    id: userID
                });

                if (userObj !== null) {

                    if (isPassMatch(password1, password2)) {
                        (await userObj).password = bcrypt.hashSync(password1, bcrypt.genSaltSync());
                        await AppDataSource.manager.save(userObj);
                        return res.status(200).json({ "success": "password changed" });
                    }

                    else {
                        return res.status(200).json({ "error": "passwords dont match" });
                    }

                }

                else {
                    return res.status(404).json({ "error": "user not found" });
                }
            }

            else {
                return res.status(422).json({ "error": "password and confirm password are required" });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ "error": "internal server error" });
        }

    }

    // authenticateToken will serve as middleware before each request that
    // requires authentication. In case user is authenticated, userID will
    // be added to req
    static async authenticateToken(req: Request, res: Response, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.sendStatus(401);

        jwt.verify(token, process.env.SECRET_KEY_JWT as string, (err: any, user: any) => {

            if (err) {
                console.log(err);
                return res.sendStatus(403);
            }

            req["user"] = user;

            next();
        });
    }

    static async changeEmail(req: Request, res: Response){
        // check if the user authenticated
        // if he/she is, generate a token with payload containing new email and his/her userID
        // send email contaning link to `confirmChangeEmail` route
    }

    static async confirmChangeEmail(req: Request, res: Response){
        // get token from req.params.changeEmailToken
        // read email and userID from payload
        // change user email to email you got from payload
    }
}
