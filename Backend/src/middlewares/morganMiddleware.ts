// import morgan from "morgan";
// import logger from "../utils/logger";

// const stream = {
//   write: (message: string) => logger.http(message.trim()),
// };
// const morganMiddleware = morgan(
//   ":method :url :status :res[content-length] - :response-time ms",
//   { stream }
// );
// export default morganMiddleware;

import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import logger from "../utils/logger";

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.http(`Request: ${req.method} ${req.originalUrl}`);
  next();
};

const responseLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);

export { requestLogger, responseLogger };
