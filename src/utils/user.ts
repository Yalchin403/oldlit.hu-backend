import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
const jwt = require("jsonwebtoken");
import mg from "./mailgun-setup";
import { initializeLogger } from "./inti-logger";

export const logger = initializeLogger();

export function isEmail(email: string) {
  let regExp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  let result: boolean = regExp.test(email);

  return result;
}

export function isDataEmpty(reqBody) {
  for (let formField in reqBody) {
    if (reqBody[formField] == "") {
      return true;
    }
  }

  if (!Object.keys(reqBody).length) {
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
    email: email_,
  });

  if (userObj.length) {
    return true;
  }

  return false;
}

export type emailDataType = {
  email: Array<string>;
  templateName: string;
  substitutions: string;
};

export async function sendEmail(
  email_to: Array<string>,
  templateName: string,
  substitutions: string
) {
  try {
    const mailgunData = {
      from: process.env.DEFAULT_FROM_EMAIL,
      to: email_to,
      template: templateName,
      "h:X-Mailgun-Variables": substitutions,
    };
    await mg.messages.create(process.env.MAILGUN_DOMAIN, mailgunData);
    logger.info(`Email has successfully been sent to ${email_to}`);
  } catch (error) {
    logger.error(`Error sending email to ${email_to}`);
    logger.error(JSON.stringify(error));
  }
}
export function generateAccessToken(payload, expiration) {
  return jwt.sign(payload, process.env.SECRET_KEY_JWT, {
    expiresIn: expiration,
  });
}

export function generateRefreshToken(payload, expiration) {
  return jwt.sign(payload, process.env.REFRESH_SECRET_KEY_JWT, {
    expiresIn: expiration,
  });
}
