import { UserAlreadyExistsError } from "../exceptions/users";
import { isEmailTaken } from "../utils/user";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { generateAccessToken, generateRefreshToken } from "../utils/user";
import { MailgunTemplates } from "../utils/enums/mailgunTemplates";
import sendEmail from "../queues/email";
import { logger } from "../server";

const baseURL: string = process.env.DOMAIN;
const bcrypt = require("bcryptjs");

export class AuthService {
  public async handleSignUp(email: string, password: string) {
    logger.info(`Creating user with email: ${email}`);
    if (await isEmailTaken(email)) {
      logger.error(`User with email: ${email} already exists`);
      throw new UserAlreadyExistsError();
    }

    const userObj = await this.createUser(email, password);
    //  send email verification
    this.sendConfirmationEmail(email, userObj.id);

    return await AppDataSource.manager.findOneBy(User, {
      id: userObj.id,
    });
  }

  private async sendConfirmationEmail(email: string, userId: number) {
    let payload = {
      userID: userId,
    };
    let token = generateAccessToken(payload, "1d");
    let verifyLink: string = `${baseURL}/api/users/confirm-email/${token}`;

    sendEmail({
      email: [email],
      templateName: MailgunTemplates.AccountVerification,
      substitutions: JSON.stringify({
        firstName: "Dear user",
        verifyLink: verifyLink,
      }),
    });
  }
  private async createUser(email: string, password: string) {
    let encrptedPass = bcrypt.hashSync(password, bcrypt.genSaltSync());
    let userObj = new User();
    userObj.email = email;
    userObj.dateJoined = new Date();
    userObj.isEmailVerified = false;
    userObj.isSuperUser = false;
    userObj.password = encrptedPass;

    // save user to db
    return await AppDataSource.manager.save(userObj);
  }
}
