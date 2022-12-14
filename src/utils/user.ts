import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
const mailgun = require("mailgun-js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");


dotenv.config();


export function isEmail(email: string) {
    let regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    let result: boolean = regExp.test(email);

    return result;
}


export function isDataEmpty(reqBody) {
    for (let formField in reqBody) {
        if (reqBody[formField] == "") {
            return true;
        }
    }

    if ((!Object.keys(reqBody).length)) {
        return true;
    }

    return false;
}


export function isPassMatch(pass1, pass2) {
    if (pass1 == pass2) {
        return true;
    }

    return false;
}


export async function isEmailTaken(email_) {
    let userObj = await AppDataSource.manager.findBy(User, {
        email: email_
    });

    if (userObj.length) {
        return true;
    }

    return false;
}

export type emailDataType = {
    email: string,
    emailSubject: string,
    emailContentHTML: string;
};


export function sendSMTPEmail(toEmail: string, subject_: string, content: string) {
    const mgObj = mailgun({
        apiKey: process.env.SMTP_API_KEY,
        domain: process.env.SMTP_DOMAIN,
        host: process.env.SMTP_API_HOST
    });
    const data = {
        from: process.env.SMTP_EMAIL,
        to: toEmail,
        subject: subject_,
        html: content
    };

    mgObj.messages().send(data, function (error, body) {
        // create loggin and add the body as loggin.INFO
        console.log(body);
    });

}


export function generateAccessToken(payload, expiration) {
    return jwt.sign(payload, process.env.SECRET_KEY_JWT, { expiresIn: expiration });
}