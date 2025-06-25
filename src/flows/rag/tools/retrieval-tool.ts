import { z } from "zod";
import { ai, InputSchema } from "../../../ai";
import { firestore, indexConfig, retriever } from "../../../services/firebase";
import { objectToText, removeNoValueProperties } from "../../../utils.ts";

export const retrievalTool = ai.defineTool(
  {
    name: "retrievalTool",
    description: "Retrieves relevant past form submissions.",
    inputSchema: InputSchema,
    outputSchema: z.array(InputSchema),
  },
  async (currentForm) => {
    // --- Simple Mock Retrieval Logic ---
    // In a real RAG, you'd embed currentForm and query a vector database
    // Here, we'll do a very basic filter by domain for demonstration.

    // const raw = fs.readFileSync("./src/data/forms.jsonl", "utf-8");
    // const forms: z.infer<typeof InputSchema>[] = raw
    //   .split("\n")
    //   .filter((line) => line.trim())
    //   .map((line) => JSON.parse(line));

    // const relevantForms = forms.filter(
    //   (pastForm) => pastForm.domain === currentForm.domain
    // );

    // return relevantForms;
    const formWithValues = removeNoValueProperties(currentForm)
    const query = objectToText(formWithValues)
    const docs = await ai.retrieve({
      retriever: retriever,
      query: query,
      options: {
        where: { domain: currentForm.domain },
      },
    });

    const chunkMatchWeight = 1;
    const timestampWeight = 0.5;

    // Step 1: Get frequency and timestamp per form
    const entries: Record<string, { chunks: number; timestamp: number }> = {};
    for (const { content } of docs) {
      const [{ text: objectId = "" }, { text: ms = 0 }] = content;

      if (!entries[objectId]) {
        // const timestamp = new Date(ts).getTime();
        entries[objectId] = {
          chunks: 0,
          timestamp: +ms,
        };
      }

      entries[objectId].chunks += chunkMatchWeight;
    }

    // Step 2: Sort by oldest
    const ascSortedByTimestamps = Object.entries(entries).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Step 3: Timestamp scoring and total score
    const ranked = ascSortedByTimestamps
      .map(([objectId, data], i) => {
        const chunkMatchScore = data.chunks;
        const timestampScore = i * timestampWeight;
        return {
          objectId,
          chunkMatchScore,
          timestampScore,
          totalScore: chunkMatchScore + timestampScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    const rankedIds = ranked.map((x) => x.objectId);

    const batches: string[][] = [];
    while (rankedIds.length) {
      batches.push(rankedIds.splice(0, 10)); // 10 - Firestore limit
    }

    const results: z.infer<ReturnType<typeof z.array<typeof InputSchema>>> = [];
    for (const batch of batches) {
      const snapshot = await firestore
        .collection(indexConfig.rawCollection)
        .where("objectId", "in", batch)
        .get();

      snapshot.forEach((doc) => {
        const { domain, form } = doc.data();
        const entry: z.infer<typeof InputSchema> = { domain, form };
        results.push(entry);
      });
    }

    return results;
  }
);
