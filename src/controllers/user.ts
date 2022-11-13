import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import sendEmail from '../queues/email';
import { initializeDotenv } from "../utils/init-dotenv";
import {
    generateAccessToken, isDataEmpty, isEmail, isEmailTaken, isPassMatch
} from '../utils/user';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { logger } from "../server";


initializeDotenv();

const SECRET_KEY_JWT: string = process.env.SECRET_KEY_JWT;
const baseURL: string = process.env.DOMAIN;
const LoginExp: string = "1800s";
const EmailConfirmExp: string = "1d";
const ForgotPassExp: string = "1d";
const ITEMS_PER_PAGE: number = +process.env.ITEMS_PER_PAGE;


export class UserController {
    static async all(req: Request, res: Response) {
        try {
            const builder = await AppDataSource.getRepository(User)
                .createQueryBuilder('user');

            if (req.query.search) {
                builder.where("(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email LIKE :search)", { search: `%${req.query.search}%` });
            }

            const is_email_verified = req.query.is_email_verified;
            if (req.query.is_email_verified) {
                builder.andWhere("user.isEmailVerified = :isEmailVerified", { isEmailVerified: is_email_verified });
            }
            
            const page: number = parseInt(req.query.page as any) || 1;
            const perPage = ITEMS_PER_PAGE;
            const total = await builder.getCount();

            builder.offset((page - 1) * perPage).limit(perPage);
            builder.select(["user.id", "user.firstName", "user.lastName", "user.email", "user.isEmailVerified", "user.dateJoined"]);

            const users = await builder.getMany();
            const responseBody = {
                "users": users,
                "total": total,
                "page": page,
                lastPage: Math.ceil(total / perPage)
            };

            return res.status(200).json(responseBody);

        } catch (err) {
            logger.error(`get all user error, err: ${err}`);
            return res.status(500).json("Internal server error");
        }
    }


    static async get(req: Request, res: Response) {
        try {
            let userID: number = parseInt(req.params.userID);
            const user = await AppDataSource.getRepository(User).findOne({

                select: ["id", "firstName", "lastName", "email", "isEmailVerified", "dateJoined"],
                where: {
                    id: userID,
                }
            });

            return res.status(200).json(user);

        } catch (err) {
            logger.error(`error getting user with. error, err: ${err}`);
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

                            return res.status(201).json(serializedUserObj);

                        }

                        else {
                            res.status(409).json({ "error": "email is already taken" });
                        }

                    } else {
                        logger.debug(`invalid email sent upon registration email: ${email}, firstname: ${firstName}`);
                        return res.status(403).json({ "error": "email is not valid" });

                    }
                } else {
                    return res.status(403).json({ "error": "password do not match" });
                }
            }

        } catch (err) {
            logger.error(`error creating user with. error, err: ${err}`);
            return res.status(500).json("Internal server error");
        }
    }

    // only for authenticated users
    static async update(req: Request, res: Response) {
        try {
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
        catch (err) {
            logger.error(`error updating user. Error: ${err}`);
        }
    }

    // only superusers
    static async destroy(req: Request, res: Response) {
        try {
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
                    logger.info(`Unauthorized attempt made to delete user with id of ${userID} by regular user with id of ${requestedUserID}`);
                    return res.status(403).json({ "error": "unauthorized attempt" });
                }
            }

            else {
                return res.status(404).json({ "error": "user not found" });
            }
        } catch (err) {
            logger.error(`error deleting user. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }
    }

    static async confirmEmail(req: Request, res: Response) {
        try {
            let token = req.params.token;
            let payload = jwt.verify(token, SECRET_KEY_JWT);
            let { userID } = payload;
            const userObj = await AppDataSource.getRepository(User).findOne({
                select: ["firstName", "email", "isEmailVerified"],
                where: {
                    id: userID
                }
            });

            if (userObj.isEmailVerified) {
                return res.status(409).json({ "error": "account is already verified" });
            }

            await AppDataSource.createQueryBuilder()
                .update(User)
                .set({
                    isEmailVerified: true
                })
                .where(
                    "id = :id", { id: userID }
                )
                .execute();

            const email: string = userObj.email;
            const emailSubject: string = "Your account has been successfully verified!";
            const emailContentHTML: string = `
            Hello, dear ${userObj.firstName},<br>

            Thank you for confirming your account, we wish you best experience in our website.
            In case someting goes unexpectedly, please do not hesitate to contact our support.<br>

            <br>Support email: support@${baseURL}<br>

            Best,<br><br>
            
            ${baseURL} Team`;

            sendEmail({
                "email": email,
                "emailSubject": emailSubject,
                "emailContentHTML": emailContentHTML
            });

            return res.json({ "sucess": "account verified" });

        } catch (err) {
            logger.error(`error verifiying the account. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
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
        } catch (err) {
            logger.error(`error logging in. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }

    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            let { email } = req.body;
            email = email.toLowerCase();
            console.log(email);
            const userObj = await AppDataSource.manager.findOneBy(User, {
                isEmailVerified: true,
                email: email
            });


            if (userObj !== null) {
                let payload = { id: userObj.id };
                let token: string = generateAccessToken(payload, ForgotPassExp);
                let changePassLink: string = `${baseURL}/users/change-password/${token}/`;
                let emailSubject = "Change your password";
                let emailContentHTML = `As per your request, you can visit the link below to change your password:
                    <br>${changePassLink}<br><br>

                    Best,

                    <br><br>

                    ${baseURL} Team
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
        } catch (err) {
            logger.error(`error sending forgot password request. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }

    }

    static async changePassword(req: Request, res: Response) {
        try {
            if (!isDataEmpty(req.body)) {
                const { password1 } = req.body;
                const { password2 } = req.body;
                const forgotPassToken = req.params.forgotPassToken;
                let payload = jwt.verify(forgotPassToken, SECRET_KEY_JWT);
                let { userID } = payload;
                let userObj = await AppDataSource.manager.findOneBy(User, {
                    id: userID
                });

                if (userObj !== null) {

                    if (isPassMatch(password1, password2)) {
                        userObj.password = bcrypt.hashSync(password1, bcrypt.genSaltSync());
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
            logger.error(`error changing passworr. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }

    }

    // authenticateToken will serve as middleware before each request that
    // requires authentication. In case user is authenticated, userID will
    // be added to req
    static async authenticateToken(req: Request, res: Response, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (token == null) {
                logger.info(`Authtoken middleware: No token provided, status code: 401`);
                return res.sendStatus(401);
            }

            jwt.verify(token, process.env.SECRET_KEY_JWT as string, (err: any, user: any) => {

                if (err) {
                    logger.info(`Authtoken middleware: Status code: 403, token verification error, Error: ${err}`);
                    return res.sendStatus(403);
                }

                req["user"] = user;

                next();
            });
        } catch (err) {
            logger.error(`error in authentication middleware user. status code: 500Error ${err}`);
            res.status(500).json({ "error": "internal server error" });
        }
    }

    static async changeEmail(req: Request, res: Response) {
        try {
            const requestedUserID = req["user"].id;
            const requestedUserObj = await AppDataSource.getRepository(User).findOne({
                where: { id: requestedUserID },
                select: ["email", "firstName"],
            });
            let newEmail: string;
            if (req.body.hasOwnProperty("newEmail")) {
                newEmail = req.body.newEmail;
                newEmail = newEmail.toLocaleLowerCase();

                if (newEmail === requestedUserObj.email) {
                    return res.status(422).json({ "error": "cannot use the same email" });
                }
                if (isEmail(newEmail)) {

                    const alreadyTakenUser = await AppDataSource.manager.findOneBy(User, {
                        email: newEmail
                    });

                    if (alreadyTakenUser !== null) {
                        return res.status(409).json({ "error": "email already taken" });
                    }
                    const payload = {
                        userID: requestedUserID,
                        newEmail: newEmail
                    };
                    const token: string = generateAccessToken(payload, '1d');
                    const emailSubject: string = "Verify your email address";
                    const changeEmailVerifyLink: string = `${baseURL}/users/confirm-change-email/${token}/`;
                    const emailContentHTML: string = `
                    Hello, dear ${requestedUserObj.firstName},<br>
                    as per your request, you can change your email address by clicking on the
                    link below:<br><br>

                    ${changeEmailVerifyLink}<br><br>

                    Thanks<br><br>

                    Best,<br><br>

                    ${baseURL} Team
                    `;
                    sendEmail({
                        "email": newEmail,
                        "emailSubject": emailSubject,
                        "emailContentHTML": emailContentHTML

                    });

                    res.status(202).json({ "success": "confirmation email sent" });
                }

                else {
                    res.status(422).json({ "error": "new email is not valid email" });
                }
            }

            else {
                res.status(422).json({ "error": "new email cannot be empty" });
            }
        } catch (err) {
            logger.error(`error requesting change email. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }



    }

    static async confirmChangeEmail(req: Request, res: Response) {
        try {
            const changeEmailToken = req.params.changeEmailToken;
            let payload = jwt.verify(changeEmailToken, SECRET_KEY_JWT);
            let { userID } = payload;
            let { newEmail } = payload;

            let userObj = await AppDataSource.manager.findOneBy(User, {
                id: userID
            });

            userObj.email = newEmail;
            AppDataSource.manager.save(userObj);
            res.status(200).json({ "success": "email address changed" });
        } catch (err) {
            logger.error(`error changing email. Error ${err}`);
            res.status(500).json({ "error": "internal server error" });
        }

    }

    static async requestReconfirmEmail(req: Request, res: Response) {
        try {
            let { email } = req.body;
            email = email.toLocaleLowerCase();
            const userObj = await AppDataSource.getRepository(User).findOne({
                select: ["id", "firstName"],
                where: {
                    email: email
                }
            });

            const payload = {
                userID: userObj.id
            };
            const reconfirmToken: string = generateAccessToken(payload, EmailConfirmExp);
            const verifyLink: string = `${baseURL}/confirm-email/${reconfirmToken}/`;
            let emailSubject: string = "Verify your email";
            let emailContentHTML: string = `
                Hello, <b>${userObj.firstName}</b>,<br>
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

            return res.status(200).json({ "success": "confirmation link sent" });
        } catch (err) {
            logger.error(`error requesting reconfirm email. Error ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }

    }
}


// TODO:
// add profile api /api/users/me
// complete api doc in swagger.json