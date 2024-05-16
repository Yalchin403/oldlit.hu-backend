import { BaseAbstractError } from "./core";
import { ErrorMessages } from "./error-messages";

export class PackageNotFoundError extends BaseAbstractError {
  constructor(
    statusCode: number = 404,
    detail: string = ErrorMessages.PackageNotFoundError
  ) {
    super(statusCode, detail);
  }
}
