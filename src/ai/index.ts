import googleAI from "@genkit-ai/googleai";
import { genkit } from "genkit/beta";
import { parse, toCodeBlock } from "../utils.ts/index.ts";
import { extractJson } from "genkit/extract";
export * from "./schema.ts";

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model("gemini-2.5-flash"),
  promptDir: "./src/prompts",
});

const embedder = googleAI.embedder("text-embedding-004");

ai.defineHelper("eq", (a: string, b: string) => a === b);
ai.defineHelper("codeblock", (data: object) => toCodeBlock(parse(data)));
ai.defineHelper("stringify", (data: object) => JSON.stringify(data, null, 2));
ai.defineFormat({ name: "inferedJSONSchema" }, (schema) => {
  let instructions: string | undefined;

  if (schema) {
    const block = toCodeBlock(schema);
    instructions = `Output should be in JSON format and conform to the following schema: ${block}`;
  }

  return {
    parseChunk: (chunk) => extractJson(chunk.accumulatedText),
    parseMessage: (message) => extractJson(message.text),
    instructions,
  };
});

export { ai, embedder };
