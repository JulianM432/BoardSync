export const ROLES = ["admin", "user"] as const;
export type Role = (typeof ROLES)[number];

export type Method = "GET" | "POST" | "PATCH" | "DELETE";

export type AccessRule = {
  method: Method;
  path: string;
  roles?: Role[];
  public?: boolean;
};

export const accessRules: readonly AccessRule[] = [
  { method: "GET", path: "/api/health", public: true },
  { method: "GET", path: "/", public: true },
  // Auth
  { method: "POST", path: "/api/auth/register", public: true },
  { method: "POST", path: "/api/auth/login", public: true },
  // Auth Authorized
  { method: "POST", path: "/api/auth/logout" },
  { method: "GET", path: "/api/users/me" },
  // Boards
  { method: "GET", path: "/api/boards" },
  { method: "GET", path: "/api/boards/:id" },
  { method: "POST", path: "/api/boards", roles: ["admin"] },
  { method: "PATCH", path: "/api/boards/:id", roles: ["admin"] },
  { method: "DELETE", path: "/api/boards/:id", roles: ["admin"] },
  // Users
  { method: "GET", path: "/api/admin/users", roles: ["admin"] },
];
