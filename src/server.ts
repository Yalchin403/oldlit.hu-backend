const express = require("express");
import { NextFunction, Request, Response } from "express";
import { UserController } from "./controllers/user";
const { trim_all } = require("request_trimmer");
const methodOverride = require("method-override");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
import { initializeLogger } from "./utils/inti-logger";
import path from "path";
import { InternalServerError } from "./exceptions/core";
const fileUpload = require("express-fileupload");
import cors from "cors";
// configure logging
export const logger = initializeLogger();

const PORT = process.env.APP_PORT;

// set up the app
const app = express();

// cors configurations
app.options('*', cors()) // include before other routes
app.use(cors());
// this endpoint is used by stripe to send webhook events. It is not included in routers as
// we need to access the raw body of the request and below we use express.json which doesnt fullfill our requirement
app.use(
  "/api/subscriptions/stripe-webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
// file upload
app.use(fileUpload());
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/media", express.static(path.join(__dirname, "media")));
app.use(trim_all);

// apply middleware to add user to request if the user is authenticated
app.use(UserController.addUserToRequestIfAuthenticated);

// override with POST having ?_method=PUT
app.use(methodOverride("_method"));

// Define Routes
app.use("/api", require("./routes/index"));
app.use("/api/users", require("./routes/users"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/contacts", require("./routes/contact"));
app.use("/api/packages", require("./routes/package"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/subscriptions", require("./routes/subscription"));

// swagger configs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// set up the server
app.listen(PORT || 5000, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (!error.statusCode || !error.detail) {
    error = new InternalServerError();
    logger.error(
      `Uncaught error occured: in the endpoint [${req.originalUrl}]`
    );
  }

  res.status(error.statusCode).json({ detail: error.detail });
});

export default app;
