declare namespace Bun {
  interface Env {
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_SECRET: string;
    TELEGRAM_CHAT_ID: string;
  }
}
