import { injectable } from "tsyringe";
import { Response } from "express";

interface ResponsePayload {
  message: string;
  response?: any;
}

@injectable()
export default class ResponseHandler {
  // Standard success response
  public success(res: Response, message: string, response?: any) {
    const payload: ResponsePayload = { message };
    if (response !== undefined) payload.response = response;
    res.status(200).json(payload);
  }

  // General error response
  public error(res: Response, message: string) {
    res.status(400).json({ message });
  }

  // Created response (201)
  public created(res: Response, message: string, response: any) {
    const payload: ResponsePayload = { message };
    if (response !== undefined) payload.response = response;
    res.status(201).json(payload);
  }

  // Not Found response (404)
  public notFound(res: Response, message: string) {
    res.status(404).json({ message });
  }

  // Conflict response (409)
  public conflict(res: Response, message: string) {
    res.status(409).json({ message });
  }

  // Unprocessable Entity (422)
  public unprocessableEntity(res: Response, message: string) {
    res.status(422).json({ message });
  }
}
