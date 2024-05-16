import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcryptjs";

AppDataSource.initialize().then(async () => {
  console.log("Creating superuser...");
  let plainPassword = process.env.SUPER_USER_PASSWORD;
  let userObj = new User();
  userObj.firstName = "Yalchin";
  userObj.lastName = "Mammadli";
  userObj.email = process.env.SUPER_USER_EMAIL;
  userObj.isSuperUser = true;
  userObj.dateJoined = new Date();
  userObj.isEmailVerified = true;
  userObj.password = bcrypt.hashSync(plainPassword, bcrypt.genSaltSync());

  await AppDataSource.manager.save(userObj);
});
