import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import ResponseHandler from "../utils/apiResponse";

@injectable()
export default class ErrorMiddleware {
  constructor(
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public handle(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.name === "ValidationError") {
      return this.handleValidationError(err, res);
    }
    if (err.statusCode) {
      return this.handleCodes(err, res);
    }
    return this.handleServerError(err, res);
  }

  private handleCodes(err: any, res: Response) {
    switch (err.statusCode) {
      case 400:
        return this.responseHandler.error(
          res,
          err.message || "Bad request",
          err
        );
      case 401:
        return this.responseHandler.unauthorized(
          res,
          err.message || "Unauthorized"
        );
      case 404:
        return this.responseHandler.notFound(
          res,
          err.message || "Resource not found"
        );
      case 409:
        return this.responseHandler.conflict(
          res,
          err.message || "Conflicting request"
        );
      default:
        return this.responseHandler.serverError(
          res,
          "Internal server error",
          err.message
        );
    }
  }

  private handleValidationError(err: any, res: Response) {
    const details = err.details?.map((e: any) => e.message) || [
      "Unknown validation error",
    ];
    return this.responseHandler.error(res, "Request validation error", {
      details,
    });
  }

  private handleServerError(err: any, res: Response) {
    return this.responseHandler.serverError(
      res,
      "Internal server error",
      err.message || "An unexpected error occurred"
    );
  }

  public notFoundHandler(req: Request, res: Response, next: NextFunction) {
    return this.responseHandler.notFound(res, "Endpoint not found");
  }
}
