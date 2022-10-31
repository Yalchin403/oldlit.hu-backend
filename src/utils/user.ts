import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
const mailgun = require("mailgun-js");

export function isEmail(email: string) {
    let regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    let result: boolean = regExp.test(email);
    
    return result;
}


export function isDataEmpty(reqBody){
    for(let formField in reqBody){
        if(reqBody[formField] == ""){
            return false;
        }
    }

    if(!reqBody.length){
        return false
    }

    return true
}


export function isPassMatch(pass1, pass2){
    if(pass1==pass2){
        return true;
    }

    return false; 
}


export async function isEmailTaken(email_){
    let userObj = await AppDataSource.manager.findBy(User, {
        email: email_
    })

    if(userObj.length){
        return true;
    }

    return false;
}

export type emailDataType = {
    firstName: string,
    email: string
    verifyLink: string
}


export function sendSMTPEmail(toEmail: string, subject_: string, content: string){
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