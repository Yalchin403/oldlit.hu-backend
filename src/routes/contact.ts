const express = require("express");
const router = express.Router();
import { ContactController } from "../controllers/contact";
import { UserController } from "../controllers/user";

router.get(
  "/:contactID/",
  UserController.authenticateToken,
  ContactController.get
);
router.get(
  "/",
  UserController.authenticateToken,
  ContactController.list
);
router.post("/", UserController.authenticateToken, ContactController.create);
router.put("/:contactID", UserController.authenticateToken, ContactController.update);
router.delete("/:contactID", UserController.authenticateToken, ContactController.delete);


module.exports = router;
