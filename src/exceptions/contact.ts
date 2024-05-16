import { BaseAbstractError } from "./core";
import { ErrorMessages } from "./error-messages";

export class ContactNotFoundError extends BaseAbstractError {
  constructor(
    statusCode: number = 404,
    detail: string = ErrorMessages.ContactNotFoundError
  ) {
    super(statusCode, detail);
  }
}
