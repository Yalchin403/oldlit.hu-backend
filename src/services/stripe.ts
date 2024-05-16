import Stripe from "stripe";
import { TransactionService } from "./transaction";
import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";
import { BookNotFoundError } from "../exceptions/books";
import { Package } from "../entity/Package";
import { PackageNotFoundError } from "../exceptions/packages";
import { TransactionNotFoundError } from "../exceptions/transactions";
import turnoffPremiumBook from "../queues/premium-updater";
import {
  TransactionTypes,
  TransactionStatuses,
} from "../utils/enums/transacttions";

const transactionService = new TransactionService();

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  public async createCheckoutSession(
    unitAmount: number,
    bookName: string,
    quantity: number = 1,
    userID: number,
    bookID: number,
    packageID: number
  ) {
    const checkoutSession = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: bookName,
            },
            unit_amount: unitAmount * 100, // convert to cents
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: process.env.PAYMENT_SUCCESS_URL + `?b_id=${bookID}`,
      cancel_url: process.env.PAYMENT_CANCEL_URL + `?b_id=${bookID}`,
      metadata: {
        bookID: bookID,
        packageID: packageID,
      },
    });

    await this.createTransaction(
      unitAmount * quantity,
      TransactionTypes.OneTimePayment,
      TransactionStatuses.Pending,
      new Date(),
      new Date(),
      userID,
      checkoutSession.id,
      packageID
    );

    return checkoutSession.url;
  }

  private async createTransaction(
    amount: number,
    type: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    userID: number,
    checkoutSessionID: string,
    packageID: number
  ): Promise<void> {
    const transaction = await transactionService.create(
      amount,
      type,
      status,
      createdAt,
      updatedAt,
      userID,
      checkoutSessionID,
      packageID
    );
  }
}

export class StripeWebhookService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  public async handleWebhookEvent(reqBody: any, reqSignature) {
    const event = this.stripe.webhooks.constructEvent(
      reqBody,
      reqSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event);
    }
  }
  private async handleCheckoutSessionCompleted(event) {
    const session = event.data.object;
    const checkoutSessionID = session.id;
    const bookID = session.metadata.bookID;
    const packageID = session.metadata.packageID;

    await this.updateTransaction(checkoutSessionID);
    await this.makeBookPremium(bookID, packageID);
  }

  private async makeBookPremium(bookID: number, packageID: number) {
    const book = await AppDataSource.getRepository(Book).findOne({
      where: {
        id: bookID,
      },
    });

    const package_ = await AppDataSource.getRepository(Package).findOne({
      where: {
        id: packageID,
      },
    });

    if (!book) {
      throw new BookNotFoundError();
    }

    if (!package_) {
      throw new PackageNotFoundError();
    }
    book.isPremium = true;
    const premiumEndsAt = new Date(
      new Date().getTime() + package_.duration * 24 * 60 * 60 * 1000
    );
    book.premiumEndsAt = premiumEndsAt;
    await AppDataSource.getRepository(Book).save(book);
    const delay = Number(premiumEndsAt) - Number(new Date());

    await turnoffPremiumBook({ bookID: book.id }, delay);
  }

  private async updateTransaction(checkoutSessionID: string) {
    const transaction = await transactionService.getBy({
      checkoutSessionID: checkoutSessionID,
    });

    await transactionService.update(transaction.id, {
      status: TransactionStatuses.Success,
      updatedAt: new Date(),
    });
  }
}
