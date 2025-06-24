import { ai, InputSchema, OutputSchema } from "../../../ai";
import fs from "fs";

export const storeFormTool = ai.defineTool(
  {
    name: "storeFormTool",
    description: `Stores a new form and returns success if stored (or false if something went wrong).`,
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (data) => {
    const file = "./src/data/forms.jsonl";
    const forms = fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));

    const formated = [...forms, data]
      .map((entry) => JSON.stringify(entry))
      .join("\n");

    fs.writeFileSync(file, formated, "utf-8");

    return {
      message: "Form successfully added to knowledge-base.",
      success: true,
    };
  }
);
