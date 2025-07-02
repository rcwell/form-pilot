import googleAI from "@genkit-ai/googleai";
import { ai, InputSchema } from "../ai";

export const formAnalyzerTool = ai.defineTool(
  {
    name: "formAnalyzerTool",
    description: "Analyzes form if its complete or incomplete",
    inputSchema: InputSchema,
    outputSchema: InputSchema,
  },
  async (input) => {
    const formStr = JSON.stringify(input.form, null, 2);
    const prompt = `
Analyze this JSON form input.

\`\`\`json
${formStr}
\`\`\`

If **all fields have values**, consider it *complete* and return it without \`schema\`.
 - Return the following:
  \`\`\`json
  {
    "domain": "${input.domain}",
    "form": ${formStr}
  }
  \`\`\`

If **any fields are incomplete**, generate a minimal JSON Schema (Draft-07) reflecting the structure.
 - Return the following:
  \`\`\`json
  {
    "domain": "${input.domain}",
    "form": ${formStr},
    "schema": {
        "type": "object",
        "properties": {
         // generated keys with only "type"
        },
        "required"[
        // all fields
        ]
    }
  }
  \`\`\`
`;

    const response = await ai.generate({
      prompt: prompt,
      model: googleAI.model("gemini-1.5-flash"),
      output: { format: "json" },
      config: { temperature: 0.2 },
    });
    return response.output;
  }
);
