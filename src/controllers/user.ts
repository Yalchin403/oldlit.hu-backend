import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import sendEmail from "../queues/email";

import {
  generateAccessToken,
  generateRefreshToken,
  isDataEmpty,
  isPassMatch,
  isEmail,
} from "../utils/user";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { logger } from "../server";
import { MailgunTemplates } from "../utils/enums/mailgunTemplates";
import {
  AccessTokenRequiredError,
  AccountIsAlreadyVerifiedError,
  CannotUpdateOtherUsersDetailError,
  InvalidAccessTokenError,
  InvalidEmailError,
  InvalidRefreshTokenError,
  NewEmailIsOldEmailError,
  PasswordAndConfirmPasswordRequiredError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../exceptions/users";
import { BaseAbstractError, ValidationError } from "../exceptions/core";
import { authSignUpSchema } from "../schemas/auth";
import { AuthService } from "../services/auth";

const SECRET_KEY_JWT: string = process.env.SECRET_KEY_JWT;
const baseURL: string = process.env.DOMAIN;
const AccessTokenExp: string = "1d";
const RefreshTokenExp: string = "7d";
const EmailConfirmExp: string = "1d";
const ForgotPassExp: string = "1d";
const ITEMS_PER_PAGE: number = +process.env.ITEMS_PER_PAGE;

export class UserController {
  static async all(req: Request, res: Response, next: NextFunction) {
    try {
      const builder = await AppDataSource.getRepository(
        User
      ).createQueryBuilder("user");

      if (req.query.search) {
        builder.where(
          "(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email LIKE :search)",
          { search: `%${req.query.search}%` }
        );
      }

      const isEmailVerified =
        String(req.query.is_email_verified).toLowerCase() === "true";
      if (isEmailVerified) {
        builder.andWhere("user.isEmailVerified = :isEmailVerified", {
          isEmailVerified: isEmailVerified,
        });
      }

      const page: number = parseInt(req.query.page as any) || 1;
      const perPage = ITEMS_PER_PAGE;
      const total = await builder.getCount();

      builder.offset((page - 1) * perPage).limit(perPage);
      builder.select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.isEmailVerified",
        "user.dateJoined",
      ]);

      const users = await builder.getMany();
      const responseBody = {
        users: users,
        total: total,
        page: page,
        lastPage: Math.ceil(total / perPage),
      };

      return res.status(200).json(responseBody);
    } catch (err) {
      logger.error(`get all user error, err: ${err}`);
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      let userID: number = parseInt(req.params.userID);
      const user = await AppDataSource.getRepository(User).findOne({
        select: [
          "id",
          "firstName",
          "lastName",
          "email",
          "isEmailVerified",
          "dateJoined",
        ],
        where: {
          id: userID,
        },
      });

      if (!user) {
        next(new UserNotFoundError());
      }
      return res.status(200).json(user);
    } catch (err) {
      logger.error(`error getting user with. error, err: ${err}`);
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // validate the request schema
      try {
        await authSignUpSchema.validateAsync(req.body);
      } catch (error) {
        next(new ValidationError(undefined, error.message));
      }
      const authService = new AuthService();
      const { email, password1 } = req.body;

      let serializedUserObj = await authService.handleSignUp(
        email,
        password1,
      );
      return res.status(201).json(serializedUserObj);
    } catch (err) {
      logger.error(
        `Error while creating user with. error, err: ${err.message}`
      );
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDataEmpty(req.body)) {
        const userID = req["user"]["id"];
        const userObj = await AppDataSource.manager.findOneBy(User, {
          id: +userID,
        });

        if (userObj == null) {
          return res.status(404).json({ error: "user not found" });
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

          return res.status(200).json({ success: "updated" });
        } else {
          next(new CannotUpdateOtherUsersDetailError());
        }
      } else {
        return res.status(422).json({ error: "request body cannot be empty" });
      }
    } catch (err) {
      logger.error(`error updating user. Error: ${err}`);
    }
  }

  // only superusers
  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = req["user"]["id"];
      const userObj = await AppDataSource.manager.findOneBy(User, {
        id: +userID,
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
            return res.status(204).json({ success: "deleted" });
          } else {
            return res.status(404).json({ error: "user not found" });
          }
        } else {
          logger.info(
            `Unauthorized attempt made to delete user with id of ${userID} by regular user with id of ${requestedUserID}`
          );
          return res.status(403);
        }
      } else {
        next(new UserNotFoundError());
      }
    } catch (err) {
      next(err);
    }
  }

  static async confirmEmail(req: Request, res: Response, next: NextFunction) {
    try {
      let token = req.params.token;
      let payload = jwt.verify(token, SECRET_KEY_JWT);
      let { userID } = payload;
      const userObj = await AppDataSource.getRepository(User).findOne({
        select: ["firstName", "email", "isEmailVerified"],
        where: {
          id: userID,
        },
      });

      if (userObj.isEmailVerified) {
        next(new AccountIsAlreadyVerifiedError());
      }

      await AppDataSource.createQueryBuilder()
        .update(User)
        .set({
          isEmailVerified: true,
        })
        .where("id = :id", { id: userID })
        .execute();

      const email: string = userObj.email;

      sendEmail({
        email: [email],
        templateName: MailgunTemplates.AccountVerified,
        substitutions: JSON.stringify({
          baseURL: baseURL,
        }),
      });
      return res.json({ sucess: "account verified" });
    } catch (err) {
      logger.error(`error verifiying the account. Error ${err}`);
      next(err);
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
          select: [
            "password",
            "id",
            "isEmailVerified",
            "firstName",
            "lastName",
            "email",
          ],
        });

        if (userObj !== null) {
          if (userObj.isEmailVerified) {
            const isPassCorrect = bcrypt.compareSync(
              password,
              userObj.password
            );
            if (isPassCorrect) {
              // Send JWT
              const payload = {
                id: userObj.id,
                email: userObj.email,
                firstName: userObj.firstName,
                lastName: userObj.lastName,
                isEmailVerified: userObj.isEmailVerified,
              };
              const accessToken = generateAccessToken(payload, AccessTokenExp);
              const refreshToken = generateRefreshToken(
                payload,
                RefreshTokenExp
              );
              return res.json({
                accessToken: accessToken,
                refreshToken: refreshToken,
              });
            } else {
              return res.status(400).json({ error: "email or password is incorrect" });
            }
          } else {
            return res.status(400).json({ error: "account not verified" });
          }
        } else {
          return res.status(400).json({ error: "user not found" });
        }
      }
    } catch (err) {
      logger.error(`error logging in. Error ${err}`);
      return res.status(500).json({ error: "internal server error" });
    }
  }

  static async getAuthToken(req: Request, res: Response, next) {
    try {
      let { refreshToken } = req.body;
      if (!refreshToken) {
        next(new AccessTokenRequiredError());
      }

      if (await UserController.isRefreshTokenValid(refreshToken)) {
        const payload = await UserController.decodeRefreshToken(refreshToken);
        delete payload["exp"];
        const authTokens = {
          accessToken: generateAccessToken(payload, AccessTokenExp),
          refreshToken: generateRefreshToken(payload, RefreshTokenExp),
        };

        return res.json(authTokens).status(200);
      } else {
        next(new InvalidRefreshTokenError());
      }
    } catch (error) {
      logger.error(`Internal server occured while logging in: [${error}]`);
      next(error);
    }
  }
  static async decodeRefreshToken(refreshToken: string) {
    return jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY_JWT);
  }
  static isRefreshTokenValid(refreshToken: string): boolean {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET_KEY_JWT as string,
      (err: any, _: any) => {
        if (err) {
          logger.info(`Couldnt verify refresh token provided: ${err}`);
          return false;
        }
      }
    );
    return true;
  }
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      let { email } = req.body;
      email = email.toLowerCase();

      const userObj = await AppDataSource.manager.findOneBy(User, {
        isEmailVerified: true,
        email: email,
      });

      if (userObj) {
        let payload = { id: userObj.id };
        let token: string = generateAccessToken(payload, ForgotPassExp);
        let changePassLink: string = `${baseURL}/api/users/change-password/${token}/`;

        sendEmail({
          email: [email],
          templateName: MailgunTemplates.ResetPassword,
          substitutions: JSON.stringify({
            changePassLink: changePassLink,
            baseURL: baseURL,
          }),
        });

        return res.status(202).json({ success: "email sent" }); // The request has been accepted for processing, but the processing has not been completed
      } else {
        next(new UserNotFoundError());
      }
    } catch (err) {
      logger.error(`error sending forgot password request. Error ${err}`);
      next(err);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDataEmpty(req.body)) {
        const { password1 } = req.body;
        const { password2 } = req.body;
        const forgotPassToken = req.params.forgotPassToken;
        let payload = jwt.verify(forgotPassToken, SECRET_KEY_JWT);
        let { userID } = payload;
        let userObj = await AppDataSource.manager.findOneBy(User, {
          id: userID,
        });

        if (userObj !== null) {
          if (isPassMatch(password1, password2)) {
            userObj.password = bcrypt.hashSync(password1, bcrypt.genSaltSync());
            await AppDataSource.manager.save(userObj);
            return res.status(200).json({ success: "password changed" });
          } else {
            return res.status(200).json({ error: "passwords dont match" });
          }
        } else {
          next(new UserNotFoundError());
        }
      } else {
        next(new PasswordAndConfirmPasswordRequiredError());
      }
    } catch (err) {
      logger.error(`error changing passworr. Error ${err}`);
      next(err);
    }
  }

  // authenticateToken will serve as middleware before each request that
  // requires authentication. In case user is authenticated, userID will
  // be added to req
  static async authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        logger.info(`Access token is not provided`);
        next(new AccessTokenRequiredError());
      }

      jwt.verify(
        token,
        process.env.SECRET_KEY_JWT as string,
        (err: any, user: any) => {
          if (err) {
            logger.info(`Couldnt verify access token provided: ${err}`);
            next(new InvalidAccessTokenError());
          }
          req["user"] = user;

          next();
        }
      );
    } catch (err) {
      logger.error(`error in authentication middleware user: [${err}]`);
      next(err);
    }
  }

  static async changeEmail(req: Request, res: Response, next: NextFunction) {
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
          next(new NewEmailIsOldEmailError());
        }
        if (isEmail(newEmail)) {
          const alreadyTakenUser = await AppDataSource.manager.findOneBy(User, {
            email: newEmail,
          });

          if (alreadyTakenUser !== null) {
            next(new UserAlreadyExistsError());
          }
          const payload = {
            userID: requestedUserID,
            newEmail: newEmail,
          };
          const token: string = generateAccessToken(payload, "1d");
          const changeEmailVerifyLink: string = `${baseURL}/api/users/confirm-change-email/${token}/`;

          sendEmail({
            email: [newEmail],
            templateName: MailgunTemplates.ChangeEmail,
            substitutions: JSON.stringify({
              changeEmailVerifyLink: changeEmailVerifyLink,
              baseURL: baseURL,
              firstName: requestedUserObj.firstName,
            }),
          });

          res.status(202).json({ success: "confirmation email sent" });
        } else {
          next(new InvalidEmailError());
        }
        next(new InvalidEmailError());
      } else {
        next(new InvalidEmailError());
      }
    } catch (err) {
      logger.error(`error requesting change email. Error ${err}`);
      next(err);
    }
  }

  static async confirmChangeEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const changeEmailToken = req.params.changeEmailToken;
      let payload = jwt.verify(changeEmailToken, SECRET_KEY_JWT);
      let { userID } = payload;
      let { newEmail } = payload;

      let userObj = await AppDataSource.manager.findOneBy(User, {
        id: userID,
      });

      userObj.email = newEmail;
      AppDataSource.manager.save(userObj);
      res.status(200).json({ success: "email address changed" });
    } catch (err) {
      logger.error(`error changing email. Error ${err}`);
      next(err);
    }
  }

  static async requestReconfirmEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { email } = req.body;
      email = email.toLocaleLowerCase();
      const userObj = await AppDataSource.getRepository(User).findOne({
        select: ["id", "firstName"],
        where: {
          email: email,
        },
      });

      if (!userObj) {
        next(new UserNotFoundError());
      }
      const payload = {
        userID: userObj.id,
      };
      const reconfirmToken: string = generateAccessToken(
        payload,
        EmailConfirmExp
      );
      const verifyLink: string = `${baseURL}/api/confirm-email/${reconfirmToken}/`;

      sendEmail({
        email: [email],
        templateName: MailgunTemplates.AccountVerification,
        substitutions: JSON.stringify({
          verifyLink: verifyLink,
          firstName: userObj.firstName,
        }),
      });

      return res.status(200).json({ success: "confirmation link sent" });
    } catch (err) {
      logger.error(`error requesting reconfirm email. Error ${err}`);
      next(err);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userID: number = parseInt(req["user"]["id"]);
      const user = await AppDataSource.getRepository(User).findOne({
        select: [
          "id",
          "firstName",
          "lastName",
          "email",
          "isEmailVerified",
          "dateJoined",
        ],
        where: {
          id: userID,
        },
      });

      if (!user) {
        next(new UserNotFoundError());
      }

      return res.status(200).json(user);
    } catch (err) {
      logger.error(`Internal server error from getProfile. Error: ${err}`);
      return res.status(500).json({ error: "internal server error" });
    }
  }

  static async addUserToRequestIfAuthenticated(
    req: Request,
    _: Response,
    next
  ) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token == null) {
        logger.info("User not found in the request");
        req["user"] = null;
      } else {
        jwt.verify(
          token,
          process.env.SECRET_KEY_JWT as string,
          (err: any, user: any) => {
            if (err) {
              req["user"] = null;
            } else {
              req["user"] = user;
            }
          }
        );
      }
    } catch (err) {
      req["user"] = null;
    }
    next();
  }
}
