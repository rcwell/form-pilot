import { z } from "zod";

const ArbitraryFormSchema = z.object({}).catchall(z.unknown());

/**
 * Minimal JSON Schema Draft 07 definition focused on form validation
 * Reference: https://json-schema.org/draft-07/schema
 */
export const FormJsonSchema: z.ZodSchema = z.lazy(() =>
  z
    .object({
      properties: ArbitraryFormSchema,
      required: z.array(z.string()).optional(),
    })
    .catchall(z.unknown())
);

const InputSchema = z.object({
  domain: z.string(),
  form: ArbitraryFormSchema,
  schema: FormJsonSchema.optional(),
});

const OutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  suggestion: ArbitraryFormSchema.optional(),
});

const PromptPartSchema = z.object({ text: z.string() });

export { InputSchema, OutputSchema, PromptPartSchema };
