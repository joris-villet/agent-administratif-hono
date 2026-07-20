/*********************************************
 *
 *        YOU NEED NGROK TO RUN THIS SCRIPT
 *           AND START THE SERVER BEFORE
 *
 *
 ***********************************************/
import 'dotenv/config';
import { spawn } from 'node:child_process';
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const secretToken = process.env.TELEGRAM_SECRET;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function setNgrokUrl() {
    spawn('ngrok', ['http', '7000']);
    await sleep(3000);
    const res = await fetch("http://127.0.0.1:4040/api/tunnels");
    const data = await res.json();
    const url = data?.tunnels?.[0]?.public_url;
    if (!url)
        throw new Error("No ngrok tunnel");
    return `https://api.telegram.org/bot${botToken}/setWebhook?url=${url}/api/telegram/message`;
}
async function setWebhook(webhookUrl) {
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_token: secretToken }),
    });
    const data = await res.json();
    if (!data.ok)
        throw new Error(JSON.stringify(data));
}
async function main() {
    try {
        const webhookUrl = await setNgrokUrl();
        await setWebhook(webhookUrl);
        console.log("🚀 Webhook set =>", webhookUrl);
    }
    catch (err) {
        console.error("❌", err);
        process.exit(1);
    }
}
main();
