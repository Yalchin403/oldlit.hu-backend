const express = require("express");
const router = express.Router();
import { ReviewController } from "../controllers/review";
import { UserController } from "../controllers/user";

router.get("/:bookID", ReviewController.getReviews);
router.post(
  "/:bookID",
  UserController.authenticateToken,
  ReviewController.createReview
);
router.put(
  "/:reviewID",
  UserController.authenticateToken,
  ReviewController.update
);
router.delete(
  "/:reviewID",
  UserController.authenticateToken,
  ReviewController.delete
);
module.exports = router;
