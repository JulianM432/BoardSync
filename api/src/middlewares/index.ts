import { errorHandler } from "./errorHandler.js";
import { requestLogger } from "./requestLogger.js";
import { access } from "./access.js";

export const middlewares = [requestLogger, access, errorHandler];
