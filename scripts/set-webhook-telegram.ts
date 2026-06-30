const secretToken = process.env.TELEGRAM_SECRET;
let ngrokUrl: string = "";

async function startServer(): Promise<boolean> {
  Bun.spawn(["bun", "run", "dev"], {
    stdout: "inherit",
  });

  await Bun.sleep(4000);

  return new Promise((resolve) => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost:7000/ping");

        if (res.ok) {
          resolve(true);
        } else {
          setTimeout(check, 500);
        }
      } catch {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

async function setNgrokUrl(): Promise<string | undefined> {
  try {
    let webhookUrl: string = "";

    Bun.spawn(["ngrok", "http", "7000"], {
      stdout: "ignore",
      stderr: "ignore",
    });

    await Bun.sleep(3000);

    const res = (await fetch("http://127.0.0.1:4040/api/tunnels")) as Record<
      string,
      any
    >;
    const data = await res.json();
    //console.log("data => ", data);

    if (data) {
      const url = data.tunnels[0].public_url;
      //console.log("Tunnel URL:", ngrokUrl);
      ngrokUrl = url;

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const endpoint = "api/telegram/message";
      webhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${url}/${endpoint}`;
      console.log("✅ webhook set => ", webhookUrl);
    }
    return webhookUrl;
  } catch (error) {
    console.log("error setNgrokUrl => ", error);
    return undefined;
  }
}

async function setWebhookUrl(webhookUrl: string): Promise<void | string> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret_token: secretToken }),
    });

    const data = await res.json();
    //console.log("response webhook telegram => ", data);
    return new Promise((resolve) => {
      if (data) resolve(webhookUrl);
    });
  } catch (error) {
    console.log("err set webhook url => ", error);
  }
}

async function main() {
  try {
    //const serverReady = await startServer();
    await startServer();
    //console.log("SERVER READY => ", serverReady);
    const url = await setNgrokUrl();
    const serverReady = await setWebhookUrl(url!);
    if (serverReady) {
      console.log("✅ Address ngrok => ", ngrokUrl);
    }
  } catch (error) {
    console.log("error function main => ", error);
  }
}

// start script
await main();
