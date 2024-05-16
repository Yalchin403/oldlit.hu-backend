import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";
import { logger } from "../server";
import { StripeService, StripeWebhookService } from "../services/stripe";
import { ValidationError } from "../exceptions/core";
import { Package } from "../entity/Package";
import { subscriptionSchema } from "../schemas/subscriptions";

export class SubscriptionController {
  static async subscribe(req: Request, res: Response, next: NextFunction) {
    // validate the request schema
    try {
      await subscriptionSchema.validateAsync(req.body);
    } catch (error) {
      next(new ValidationError(undefined, error.message));
    }

    const stripeService = new StripeService();
    const { bookID, packageID } = req.body;

    try {
      const boookBuilder =
        AppDataSource.getRepository(Book).createQueryBuilder("book");

      const packageBuilder =
        AppDataSource.getRepository(Package).createQueryBuilder("package_");
      const book = await boookBuilder
        .where("book.id = :id", { id: bookID })
        .getOne();
      const package_ = await packageBuilder
        .where("package_.id = :id", { id: packageID })
        .getOne();

      if (!book) {
        return res.status(404).json({ detail: "book not found" });
      }

      if (!package_) {
        return res.status(404).json({ detail: "package not found" });
      }

      // create checkout session
      const checkoutSessionURL = await stripeService.createCheckoutSession(
        package_.price,
        book.name,
        1,
        req["user"]["id"],
        bookID,
        packageID
      );

      return res.status(201).json({ url: checkoutSessionURL });
    } catch (err) {
      logger.error(`Internal server error on get all books, Error: ${err}`);
      next(err);
    }
  }
  static async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    const stripeWebhookService = new StripeWebhookService();
    const sig = req.headers["stripe-signature"];
    const body = req.body;

    try {
      await stripeWebhookService.handleWebhookEvent(body, sig);

      return res.status(200).json({ received: true });
    } catch (err) {
      logger.error(`Internal server error on stripe webhook, Error: ${err}`);
      next(err);
    }
  }
}
