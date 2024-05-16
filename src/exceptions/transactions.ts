import { BaseAbstractError } from "./core";
import { ErrorMessages } from "./error-messages";

export class TransactionNotFoundError extends BaseAbstractError {
  constructor(
    statusCode: number = 404,
    detail: string = ErrorMessages.TransactionNotFoundError
  ) {
    super(statusCode, detail);
  }
}
