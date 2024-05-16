import { BaseAbstractError } from "./core";
import { ErrorMessages } from "./error-messages";

export class BookNotFoundError extends BaseAbstractError {
  constructor(
    statusCode: number = 404,
    detail: string = ErrorMessages.BookNotFoundError
  ) {
    super(statusCode, detail);
  }
}
