import { ChatOpenAI } from '@langchain/openai';

type TitleMessage = { role: string; content: string }

export async function generateTitle(messages: TitleMessage[]): Promise<string> {

  const model = new ChatOpenAI({
    modelName: 'google/gemini-2.5-flash-lite',
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: 0.8,
    maxTokens: 150,
    timeout: 300000,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  })

  // const model = new ChatOpenAI({
  //   modelName: "gemma3:1b",
  //   temperature: 0.5,
  //   timeout: 300000,
  //   apiKey: "not-needed",
  //   configuration: {
  //     baseURL: "http://localhost:11434/v1",
  //   },
  // });

  //console.log("messages => ", messages)

  const convo = messages
    .map(m => `${m.role === 'user' ? '\nUser' : '\nAssistant'}: ${m.content.slice(0, 200)}`)
    .join('\n')

  const prompt = [
    {
      role: 'system',
      content: 'Generate a french short title (max 6 words) for this conversation. Reply with ONLY the title, nothing else.'
    },
    {
      role: 'user',
      content: convo,
    },
  ]

  // console.log('convo => ', convo)
  // console.log('prompt => ', prompt)

  const res = await model.invoke(prompt)

  if (res) {
    console.log('res => ', res)
  }

  return res.text.trim()
}