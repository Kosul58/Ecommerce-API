import { injectable } from "tsyringe";
import { Response } from "express";

interface SuccessResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: any;
}

@injectable()
export default class ResponseHandler {
  public success<T>(res: Response, message: string, data?: T) {
    const payload: SuccessResponse<T> = {
      success: true,
      message,
    };
    if (data !== undefined) payload.data = data;
    res.status(200).json(payload);
  }

  public error(res: Response, message: string, error?: any) {
    const payload: ErrorResponse = {
      success: false,
      message,
    };
    if (error !== undefined) payload.error = error;
    res.status(400).json(payload);
  }

  public created<T>(res: Response, message: string, data?: T) {
    const payload: SuccessResponse<T> = {
      success: true,
      message,
    };
    if (data !== undefined) payload.data = data;
    res.status(201).json(payload);
  }

  public notFound(res: Response, message: string) {
    res.status(404).json({
      success: false,
      message,
    });
  }

  public conflict(res: Response, message: string, error?: any) {
    const payload: ErrorResponse = {
      success: false,
      message,
    };
    if (error !== undefined) payload.error = error;
    res.status(409).json(payload);
  }

  public unprocessableEntity(res: Response, message: string, error?: any) {
    const payload: ErrorResponse = {
      success: false,
      message,
    };
    if (error !== undefined) payload.error = error;
    res.status(422).json(payload);
  }

  public unauthorized(res: Response, message: string) {
    res.status(401).json({
      success: false,
      message,
    });
  }

  public forbidden(res: Response, message: string) {
    res.status(403).json({
      success: false,
      message,
    });
  }

  public serverError(res: Response, message: string, error?: any) {
    const payload: ErrorResponse = {
      success: false,
      message,
    };
    if (error !== undefined) payload.error = error;
    res.status(500).json(payload);
  }
}
