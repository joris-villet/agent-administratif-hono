// import { Hono } from "hono";
// import { cors } from "hono/cors";
// import { bodyLimit } from "hono/body-limit";
// import { logger } from "hono/logger";
// import { secureHeaders } from "hono/secure-headers";
// import { serveStatic } from "hono/bun";
// import type { Env } from "./types/env";
// import { sessionMiddleware } from "./middleware/session";
// import { seedAdmin } from "@/db/seed";
// import betterAuth from "./routes/auth";
// import agentRoutes from "./routes/agent";
// import threadRoutes from "./routes/thread";
// import conversationRoutes from "./routes/conversation";
// import telegramRoutes from "./routes/telegram";
// const app = new Hono<Env>();
// app.use(logger());
// app.use("/static/*", serveStatic({ root: "./" }));
// app.use(
//   "*",
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:4321",
//     allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     credentials: true,
//     maxAge: 86400,
//   })
// );
// app.use(
//   bodyLimit({
//     maxSize: 2 * 1024 * 1024,
//     onError: (c) => {
//       return c.text("overflow :(", 413);
//     },
//   })
// );
// app.use(secureHeaders());
// app.use("*", sessionMiddleware);
// app.route("/api/auth/*", betterAuth);
// app.route("/api/agent", agentRoutes);
// app.route("/api/thread", threadRoutes);
// app.route("/api/conversation", conversationRoutes);
// app.route("/api/telegram", telegramRoutes);
// // Welcome server
// app.get("/", async (c) => {
//   const file = Bun.file("./static/index.html");
//   const page = await file.text();
//   return c.html(page);
// });
// app.get("/ping", async (c) => {
//   return c.json("pong", 200);
// });
// const startServer = async () => {
//   console.log("🌱 Seeding admin...");
//   await seedAdmin();
//   const port = process.env.PORT ? parseInt(process.env.PORT) : 7000;
//   const server = Bun.serve({
//     port,
//     fetch: app.fetch,
//   });
//   console.log(`🚀 Server ready on ${server.url}`);
// };
// startServer().catch((err) => {
//   console.error("❌ startServer crashed:", err);
//   process.exit(1);
// });
import 'dotenv/config';
import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "fs/promises";
import { sessionMiddleware } from "./middleware/session";
import { seedAdmin } from "@/db/seed";
import betterAuth from "./routes/auth";
import agentRoutes from "./routes/agent";
import threadRoutes from "./routes/thread";
import conversationRoutes from "./routes/conversation";
import telegramRoutes from "./routes/telegram";
const app = new Hono();
app.use(logger());
app.use("/static/*", serveStatic({ root: "./" }));
app.use("*", cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:4321",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
}));
app.use(bodyLimit({
    maxSize: 2 * 1024 * 1024,
    onError: (c) => c.text("overflow :(", 413),
}));
app.use(secureHeaders());
app.use("*", sessionMiddleware);
// app.route("/api/auth/*", betterAuth);
// app.route("/api/agent", agentRoutes);
// app.route("/api/thread", threadRoutes);
// app.route("/api/conversation", conversationRoutes);
app.route("/api/telegram", telegramRoutes);
app.get("/", async (c) => {
    const page = await readFile("./static/index.html", "utf-8");
    return c.html(page);
});
app.get("/ping", (c) => c.json("pong", 200));
const startServer = async () => {
    console.log("🌱 Seeding admin...");
    await seedAdmin();
    const { serve } = await import("@hono/node-server");
    const port = process.env.PORT ? parseInt(process.env.PORT) : 7000;
    serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
        console.log(`🚀 Server ready on http://localhost:${info.port}`);
    });
};
startServer().catch((err) => {
    console.error("❌ startServer crashed:", err);
    process.exit(1);
});
