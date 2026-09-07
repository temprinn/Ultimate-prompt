import { randomUUID } from "crypto";
import { query } from "@/lib/db/pool";
import type { ApiUser } from "@/lib/api/auth";
import { createSession } from "./session";

const DEMO_USERS = {
  free: {
    id: "11111111-1111-1111-1111-111111111111",
    email: "free@example.com",
    name: "Free Tester",
    role: "free" as const,
  },
  admin: {
    id: "33333333-3333-3333-3333-333333333333",
    email: "admin@example.com",
    name: "Admin Tester",
    role: "admin" as const,
  },
};

export async function ensureDemoUser(kind: "free" | "admin") {
  const demo = DEMO_USERS[kind];
  await query(
    `INSERT INTO users (id, email, name, role, email_verified_at)
     VALUES (:id, :email, :name, :role, UTC_TIMESTAMP(3))
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       role = VALUES(role)`,
    demo
  );
  return {
    id: demo.id,
    email: demo.email,
    name: demo.name,
    role: demo.role,
  } satisfies ApiUser;
}

export { createSession, DEMO_USERS };
