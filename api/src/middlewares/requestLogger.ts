import type { NextFunction, Request, Response } from "express";

const reset = "\x1b[0m";
const dim = "\x1b[2m";
const cyan = "\x1b[36m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const magenta = "\x1b[35m";

const getStatusColor = (status: number): string => {
  if (status >= 500) return red;
  if (status >= 400) return yellow;
  if (status >= 300) return cyan;
  return green;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.path.startsWith("/uploads")) {
    next();
    return;
  }

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const datetime = new Date().toISOString();
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${dim}${datetime}${reset} ${cyan}${req.method}${reset} ${blue}${req.originalUrl}${reset} ${statusColor}${res.statusCode}${reset} ${magenta}${durationMs}ms${reset}`,
    );
  });

  next();
};
