import type { ContentBlock } from "langchain";

export async function sendMessage(
  chatId: string,
  message: string | (ContentBlock | ContentBlock.Text)[]
): Promise<void | boolean | string> {
  try {
    const tokenTelegram = process.env.TELEGRAM_BOT_TOKEN as string;
    const url = `https://api.telegram.org/bot${tokenTelegram}/sendMessage`;

    // const res = await fetch(url, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     chat_id: chatId,
    //     text: message,
    //   }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // const data = await res.json();
    return new Promise((resolve) => {
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (res.ok) return resolve("message send");
      });
    });
  } catch (error) {
    throw new Error(`Error from sendMessage telegram: ${error}`);
  }
}

// export const sendMessage = async (
//   chatId: string,
//   text: string | (ContentBlock | ContentBlock.Text)[]
// ) => {
//   try {
//     await ky
//       .post(`https://api.telegram.org/bot${tokenTelegram}/sendMessage`, {
//         json: {
//           chat_id: chatId,
//           text,
//         },
//       })
//       .json()
//   } catch (error) {
//     throw new Error(`Error from sendMessage telegram: ${error}`)
//   }
// }
