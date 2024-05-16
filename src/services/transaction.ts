import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { logger } from "../server";
import { Contact } from "../entity/Contact";
import { Transaction } from "../entity/Transaction";
import { TransactionNotFoundError } from "../exceptions/transactions";
import { Package } from "../entity/Package";
import { TransactionStatuses } from "../utils/enums/transacttions";


const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);
interface TransactionUpdateData {
  status?: string;
  updatedAt?: Date;
  // Add any other properties you want to update dynamically
}

interface TransactionSearchParams {
  [key: string]: any;
}
export class TransactionService {
  public async create(
    amount: number,
    type: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    userID: number,
    checkoutSessionID: string,
    packageID: number
  ) {
    logger.info(`Creating transaction for user with ID: ${userID}`);

    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userID,
      },
    });

    const transaction = new Transaction();
    transaction.amount = amount;
    transaction.type = type;
    transaction.status = status;
    transaction.user = user;
    transaction.createdAt = createdAt;
    transaction.updatedAt = updatedAt;
    transaction.checkoutSessionID = checkoutSessionID;
    transaction.package = { id: packageID } as Package;
    return await AppDataSource.manager.save(transaction);
  }

  public async get(transactionID: number, userID: number) {
    const transaction = await AppDataSource.getRepository(Contact).findOne({
      where: {
        id: transactionID,
        user: { id: userID },
      },
    });

    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    return transaction;
  }

  public async getBy(searchParams: TransactionSearchParams) {
    const { relations, ...where } = searchParams;
    where.status = TransactionStatuses.Pending;  // Add this line to filter only pending transactions
    const transaction = await AppDataSource.getRepository(Transaction).findOne({
      where,
      relations: relations ? relations : undefined,
    });

    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    return transaction;
  }

  public async update(
    transactionID: number,
    updateData: TransactionUpdateData
  ) {
    const transaction = await AppDataSource.getRepository(Transaction).findOne({
      where: { id: transactionID },
    });

    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    // Update the transaction properties with the provided updateData
    Object.assign(transaction, updateData);

    // If no updatedAt is provided, set it to the current date
    if (!updateData.updatedAt) {
      transaction.updatedAt = new Date();
    }

    return await AppDataSource.manager.save(transaction);
  }

  public async list(userID: number, page: number) {
    const transactions = await AppDataSource.getRepository(Transaction).find({
      where: {
        user: { id: userID },
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const responseBody = {
      transactions,
      page,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    return responseBody;
  }
}
