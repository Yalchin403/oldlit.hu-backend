import { BaseAbstractError } from "./core";
import { ErrorMessages } from "./error-messages";

export class AccessTokenRequiredError extends BaseAbstractError {
  constructor(
    statusCode: number = 401,
    detail: string = ErrorMessages.AccessTokenRequiredError
  ) {
    super(statusCode, detail);
  }
}

export class InvalidAccessTokenError extends BaseAbstractError {
  constructor(
    statusCode: number = 401,
    detail: string = ErrorMessages.InvalidAccessTokenError
  ) {
    super(statusCode, detail);
  }
}

export class InvalidRefreshTokenError extends BaseAbstractError {
  constructor(
    statusCode: number = 400,
    detail: string = ErrorMessages.InvalidRefreshTokenError
  ) {
    super(statusCode, detail);
  }
}

export class UserNotFoundError extends BaseAbstractError {
  constructor(
    statusCode: number = 404,
    detail: string = ErrorMessages.UserNotFoundError
  ) {
    super(statusCode, detail);
  }
}

export class UserAlreadyExistsError extends BaseAbstractError {
  constructor(
    statusCode: number = 400,
    detail: string = ErrorMessages.UserAlreadyExistsError
  ) {
    super(statusCode, detail);
  }
}

export class InvalidEmailError extends BaseAbstractError {
  constructor(
    statusCode: number = 422,
    detail: string = ErrorMessages.InvalidEmailError
  ) {
    super(statusCode, detail);
  }
}

export class UnmatchedPasswordsError extends BaseAbstractError {
  constructor(
    statusCode: number = 422,
    detail: string = ErrorMessages.UnmatchedPasswordsError
  ) {
    super(statusCode, detail);
  }
}

export class CannotUpdateOtherUsersDetailError extends BaseAbstractError {
  constructor(
    statusCode: number = 403,
    detail: string = ErrorMessages.CannotUpdateOtherUsersDetailError
  ) {
    super(statusCode, detail);
  }
}

export class AccountIsAlreadyVerifiedError extends BaseAbstractError {
  constructor(
    statusCode: number = 400,
    detail: string = ErrorMessages.AccountIsAlreadyVerifiedError
  ) {
    super(statusCode, detail);
  }
}

export class PasswordAndConfirmPasswordRequiredError extends BaseAbstractError {
  constructor(
    statusCode: number = 400,
    detail: string = ErrorMessages.PasswordAndConfirmPasswordRequiredError
  ) {
    super(statusCode, detail);
  }
}

export class NewEmailIsOldEmailError extends BaseAbstractError {
  constructor(
    statusCode: number = 400,
    detail: string = ErrorMessages.NewEmailIsOldEmailError
  ) {
    super(statusCode, detail);
  }
}
