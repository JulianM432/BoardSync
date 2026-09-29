import { match } from "path-to-regexp";
import type { Request } from "express";
import { accessRules, type AccessRule } from "../config/permissions.js";

export function findAccessRule(req: Request): AccessRule | undefined {
  return accessRules.find((rule) => {
    if (rule.method !== req.method) {
      return false;
    }
    const matcher = match(rule.path);
    return matcher(req.path);
  });
}
