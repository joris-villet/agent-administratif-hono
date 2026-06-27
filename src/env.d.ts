declare namespace Bun {
  interface Env {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly DATABASE_URL: string;
    readonly TELEGRAM_BOT_TOKEN: string;
    readonly TELEGRAM_SECRET: string;
    readonly TELEGRAM_CHAT_ID: string;
    readonly VAULTWARDEN_URL: string;
    readonly VAULTWARDEN_SIGNUPS_ALLOWED: boolean;
    readonly VAULTWARDEN_ADMIN_TOKEN: string;
    readonly VAULTWARDEN_EMAIL: string;
    readonly VAULTWARDEN_PASSWORD: string;
    readonly HASH: string;
  }
}
