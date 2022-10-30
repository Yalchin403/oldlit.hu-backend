import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import nodemailer from "nodemailer"


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
    console.log("sending email...");
    let configOptions = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASS
        }
    };
    let transport = nodemailer.createTransport(configOptions);

    transport.verify(function(error, success) {
        if (error) {
              console.log(error);
        } else {
              console.log('Server is ready to take our messages');
        }
      });

    var mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: toEmail,
        subject: subject_,
        html: content
    };
    transport.sendEmail(mailOptions, (err, info) => {
        if(err){
            return console.log(err);
        }
        console.log("Message sent: %s", info.messageId);
    })
}