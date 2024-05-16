const express = require("express");
const router = express.Router();
import { CategoryController } from "../controllers/categories";

router.get(
  "/",
  CategoryController.list
);



module.exports = router;
