import 'dotenv/config';
import fetch from "node-fetch";
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const secretToken = process.env.TELEGRAM_SECRET;
// console.log("botToken => ", botToken);
// console.log("secretToken => ", secretToken);
const TELEGRAM_ENDPOINT = process.env.TELEGRAM_ENDPOINT;
async function setWebhook() {
    try {
        const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${TELEGRAM_ENDPOINT}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret_token: secretToken }),
        });
        const data = await res.json();
        console.log("📡 Telegram response:", data);
        if (data) {
            console.log("🚀 Webhook set:", url);
        }
        else {
            console.log("❌ Failed to set webhook");
        }
    }
    catch (err) {
        console.error("Error setting webhook:", err);
    }
}
async function main() {
    await setWebhook();
}
main();
