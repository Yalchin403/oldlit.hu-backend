import { ErrorMessages } from "./error-messages";
export class BaseAbstractError extends Error {
  public readonly detail: string;
  public readonly statusCode: number;

  constructor(statusCode: number, detail: string) {
    super(detail);
    Object.setPrototypeOf(this, BaseAbstractError.prototype);
    this.message = detail;
    this.detail = detail;
    this.statusCode = statusCode;
  }

  toString() {
    return {
      detail: this.detail,
    };
  }
}

export class InternalServerError extends BaseAbstractError {
  constructor(
    statusCode: number = 500,
    detail: string = ErrorMessages.InternalServerError
  ) {
    super(statusCode, detail);
  }
}

export class ValidationError extends BaseAbstractError {
  constructor(statusCode: number = 422, detail: string) {
    super(statusCode, detail);
  }
}
