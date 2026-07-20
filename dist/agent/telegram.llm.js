// import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
// import { initChatModel } from "langchain";
import { promptSystem } from "./prompt-system";
import { allTools } from "./tools/allTools";
// let checkpointer: PostgresSaver;
export const setAgent = async () => {
    const modelName = process.env.CLOUD_LLM;
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("[agent] model:", modelName, "| key:", apiKey ? `SET (${apiKey.slice(0, 8)}...)` : "MISSING");
    const model = new ChatOpenAI({
        modelName,
        apiKey,
        temperature: 0.7,
        maxTokens: 2000,
        timeout: 300000,
        configuration: {
            baseURL: "https://openrouter.ai/api/v1",
        },
    });
    // const llmLocal = "hf.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF:Q4_K_M";
    // const model = new ChatOpenAI({
    //   modelName: llmLocal,
    //   temperature: 0.7,
    //   timeout: 300000,
    //   apiKey: "not-needed",
    //   configuration: {
    //     baseURL: "http://localhost:11434/v1",
    //   },
    // });
    // if (!checkpointer) {
    //   console.log(
    //     "[agent] Initializing PostgresSaver with DATABASE_URL:",
    //     process.env.DATABASE_URL ? "SET" : "MISSING"
    //   );
    //   checkpointer = PostgresSaver.fromConnString(
    //     process.env.DATABASE_URL as string
    //   );
    //   await checkpointer.setup();
    //   console.log("[agent] Checkpointer setup complete");
    // }
    return createAgent({
        model,
        tools: [...allTools],
        systemPrompt: promptSystem,
        // checkpointer,
    });
};
