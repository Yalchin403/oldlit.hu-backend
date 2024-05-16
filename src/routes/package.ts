const express = require("express");
const router = express.Router();
import { PackageController } from "../controllers/packages";
import { UserController } from "../controllers/user";

router.get(
  "/",
  UserController.authenticateToken,
  PackageController.list
);
module.exports = router;
