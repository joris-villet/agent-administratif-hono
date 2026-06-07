import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'
import { ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain'
import { promptSystem } from './prompt-system'
import { allTools } from './tools/allTools'
import { ChatOllama } from "@langchain/ollama"

let checkpointer: PostgresSaver

// const resolveApiKey = (): string | undefined => {
//   const raw = process.env.OPENROUTER_API_KEY

//   if (!raw) return undefined;

//   return raw.trim().replace(/^Bearer\s+/i, "");
// };

export const setAgent = async () => {
  const modelName = process.env.LLM_NAME as string
  // const apiKey = resolveApiKey();
  const apiKey = process.env.OPENROUTER_API_KEY as string
  console.log('[agent] model:', modelName, '| key:', apiKey ? `SET (${apiKey.slice(0, 8)}...)` : 'MISSING')

  // const model = new ChatOpenAI({
  //   modelName,
  //   apiKey,
  //   temperature: 0.7,
  //   maxTokens: 2000,
  //   timeout: 300000,
  //   configuration: {
  //     baseURL: 'https://openrouter.ai/api/v1',
  //   },
  // })

  const model = new ChatOpenAI({
    modelName: "gemma3:1b",        // Nom arbitraire, LM Studio l'ignore
    temperature: 0.7,
    //maxTokens: 2000,
    timeout: 300000,
    apiKey: "not-needed",      // Clé bidon, l'API locale n'en a pas besoin
    configuration: {
      baseURL: "http://localhost:11434/v1",
    },
  });



  if (!checkpointer) {
    console.log('[agent] Initializing PostgresSaver with DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING')
    checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL as string)
    await checkpointer.setup()
    console.log('[agent] Checkpointer setup complete')
  }

  return createAgent({
    model,
    tools: allTools,
    systemPrompt: promptSystem,
    checkpointer,
  })
}
