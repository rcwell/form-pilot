import { chunk } from "llm-chunk";
import { ai, InputSchema, OutputSchema } from "../../ai";
import { convertJsonToDescriptiveText } from "../../utils.ts";
import { firestore, indexConfig } from "../../services/firebase.ts";
import { FieldValue } from "firebase-admin/firestore";

export const storeFlow = ai.defineFlow(
  {
    name: "storeFlow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async ({ domain, form }) => {
    try {
      const objectId = `form_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const descriptive = await ai.run(`stringify : ${objectId}`, async () =>
        convertJsonToDescriptiveText(form)
      );

      const chunks = await ai.run(`chunkify : ${objectId}`, async () =>
        chunk(descriptive, {
          splitter: "sentence",
          maxLength: 768,
          minLength: 0,
          overlap: 50,
        })
      );

      const embeddedChunks = await ai.run(
        `document : ${objectId}`,
        async () => {
          const embeddings: number[][] = [];

          for (const chunkText of chunks) {
            const embeddingResult = await ai.embed({
              embedder: indexConfig.embedder,
              content: chunkText,
            });

            // Ensure embedding is available
            if (
              !embeddingResult ||
              !embeddingResult[0] ||
              !embeddingResult[0].embedding
            ) {
              throw new Error("Failed to generate embedding for chunk.");
            }

            embeddings.push(embeddingResult[0].embedding);
          }

          return embeddings;
        }
      );

      await ai.run(`store_${objectId}`, async () => {
        const batch = firestore.batch();
        const timestamp = FieldValue.serverTimestamp();

        // Save chunked vector embeddings
        embeddedChunks.forEach((chunk) => {
          const vectorRef = firestore.collection(indexConfig.collection).doc();
          batch.set(vectorRef, {
            [indexConfig.contentField]: objectId,
            [indexConfig.vectorField]: FieldValue.vector(chunk),
            timestamp,
            domain,
          });
        });

        // Save raw forms
        const rawRef = firestore.collection(indexConfig.rawCollection).doc();
        batch.set(rawRef, {
          timestamp,
          objectId,
          domain,
          form,
        });
        await batch.commit();
      });

      return {
        message: `Successfully saved form.`,
        success: true,
      };
    } catch (error) {
      return {
        message: "Something went wrong with saving the form.",
        success: false,
      };
    }
  }
);
