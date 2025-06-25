import { ai } from "./ai";
import { InputSchema, OutputSchema } from "./ai/schema";
import { formAnalyzerTool, invokeRag, invokeStore } from "./tools";
import { schema } from "./utils.ts";

export const pilotAgent = ai.definePrompt(
  {
    name: "pilotAgent",
    description: `Retrieves relevant past form submissions based on currentForm and returns a formatted form value suggestions.`,
    input: schema(InputSchema),
    output: schema(OutputSchema),
    tools: [formAnalyzerTool, invokeRag, invokeStore],
    system: `
You are a control agent responsible for coordinating flows usage to handle input requests.

First, analyze the input using the \`formAnalyzerTool\` tool.
If \`formAnalyzerTool\` output has \`schema\`, use \`invokeRag\` tool, else \`invokeStore\` tool.

Then return desired output from tool's output

Constraints:
- Do **not** alter tool outputs and inputs.
- Do **not** generate any content yourself under any circumstance.
- Do **not** include any explanations, comments, logging, or metadata.`,
  },
  `
  input:
  {{codeblock}}
  `
);
