export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public success?: boolean,
  ) {
    super(message);
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}
