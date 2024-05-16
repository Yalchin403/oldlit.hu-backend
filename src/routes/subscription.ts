const express = require("express");
const router = express.Router();
import { SubscriptionController } from "../controllers/subscriptions";
import { UserController } from "../controllers/user";

router.post(
  "/subscribe",
  UserController.authenticateToken,
  SubscriptionController.subscribe
);
router.post(
  "/stripe-webhook",
  SubscriptionController.stripeWebhook
);

module.exports = router;
