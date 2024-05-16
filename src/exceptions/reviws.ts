import { BaseAbstractError } from "./core";
import { ErrorMessages } from "./error-messages";

export class ReviewNotFoundError extends BaseAbstractError {
  constructor(
    statusCode: number = 404,
    detail: string = ErrorMessages.ReviewNotFoundError
  ) {
    super(statusCode, detail);
  }
}
