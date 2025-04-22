// src/types/custom.d.ts or src/express.d.ts
import { Request } from "express";
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}
