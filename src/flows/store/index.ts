import { chunk } from "llm-chunk";
import { ai, InputSchema, OutputSchema } from "../../ai";
import { objectToText, removeNoValueProperties } from "../../utils.ts";
import { firestore, indexConfig } from "../../services/firebase.ts";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "genkit";

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

      const formWithValues = removeNoValueProperties(form);

      const descriptive = await ai.run(`stringify : ${objectId}`, async () =>
        objectToText(formWithValues)
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
          form: formWithValues,
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

export const deleteFlow = ai.defineFlow(
  {
    name: "deleteFlow",
    inputSchema: z.object({
      property: z.string(),
      values: z.array(z.string()),
    }),
    outputSchema: z.boolean(),
  },
  async (input) => {
    try {
      await ai.run(`delete`, async () => {
        input.values.forEach(async (id) => {
          const batch = firestore.batch();
          const vectorRef = await firestore
            .collection(indexConfig.collection)
            .where(
              input.property === "objectId" ? "text" : input.property,
              "==",
              id
            )
            .get();
          const rawRef = await firestore
            .collection(indexConfig.rawCollection)
            .where(input.property, "==", id)
            .get();

          vectorRef.forEach((doc) => {
            batch.delete(doc.ref);
          });

          rawRef.forEach((doc) => {
            batch.delete(doc.ref);
          });

          await batch.commit();
        });
      });

      return true;
    } catch {
      return false;
    }
  }
);

export const seedData = ai.defineFlow(
  {
    name: "seedDataFlow",
    inputSchema: z.enum(["dc", "marvel", "notes"]),
    outputSchema: z.boolean(),
  },
  async (input) => {
    try {
      const heroes = data[input];

      for (const hero of heroes) {
        await storeFlow({ domain: input, form: hero });
      }

      return true;
    } catch {
      return false;
    }
  }
);
const data = {
  marvel: [
    {
      firstName: "Tony",
      lastName: "Stark",
      age: 48,
      email: "tony@starkindustries.com",
      username: "ironman",
      password: "Iron$uit123",
      confirmPassword: "Iron$uit123",
      phone: "+14151112222",
      birthdate: "1977-05-29",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Steve",
      lastName: "Rogers",
      age: 105,
      email: "steve@avengers.us",
      username: "capamerica",
      password: "Sh1eldPower!",
      confirmPassword: "Sh1eldPower!",
      phone: "+14152223333",
      birthdate: "1919-07-04",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "Natasha",
      lastName: "Romanoff",
      age: 38,
      email: "natasha@shield.gov",
      username: "blackwidow",
      password: "SpyQueen99!",
      confirmPassword: "SpyQueen99!",
      phone: "+14153334444",
      birthdate: "1986-11-22",
      gender: "female",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Bruce",
      lastName: "Banner",
      age: 45,
      email: "bruce@sciencehub.com",
      username: "hulk",
      password: "Sm4shT1me!",
      confirmPassword: "Sm4shT1me!",
      phone: "+14154445555",
      birthdate: "1979-12-18",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "Peter",
      lastName: "Parker",
      age: 21,
      email: "peter@dailybugle.com",
      username: "spiderman",
      password: "WebSling3r!",
      confirmPassword: "WebSling3r!",
      phone: "+14155556666",
      birthdate: "2004-08-10",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Stephen",
      lastName: "Strange",
      age: 42,
      email: "drstrange@sorcery.org",
      username: "drstrange",
      password: "TimeStone!",
      confirmPassword: "TimeStone!",
      phone: "+14156667777",
      birthdate: "1982-02-02",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Carol",
      lastName: "Danvers",
      age: 39,
      email: "carol@spaceforce.com",
      username: "captainmarvel",
      password: "BinaryBlast!",
      confirmPassword: "BinaryBlast!",
      phone: "+14157778888",
      birthdate: "1985-10-14",
      gender: "female",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "T'Challa",
      lastName: "Udaku",
      age: 40,
      email: "tchalla@wakanda.gov",
      username: "blackpanther",
      password: "WakandaF0r3ver!",
      confirmPassword: "WakandaF0r3ver!",
      phone: "+14158889999",
      birthdate: "1984-03-01",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Wanda",
      lastName: "Maximoff",
      age: 32,
      email: "wanda@hexmail.com",
      username: "scarletwitch",
      password: "ChaosMagic!",
      confirmPassword: "ChaosMagic!",
      phone: "+14159990000",
      birthdate: "1993-01-15",
      gender: "female",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Scott",
      lastName: "Lang",
      age: 38,
      email: "scott@quantumtech.io",
      username: "antman",
      password: "AntS1z3r!",
      confirmPassword: "AntS1z3r!",
      phone: "+14150001111",
      birthdate: "1987-06-30",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
  ],
  dc: [
    {
      firstName: "Clark",
      lastName: "Kent",
      age: 35,
      email: "clark.kent@dailyplanet.com",
      username: "superman",
      password: "Krypt0n123!",
      confirmPassword: "Krypt0n123!",
      phone: "+1234567890",
      birthdate: "1988-06-18",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "Bruce",
      lastName: "Wayne",
      age: 40,
      email: "bruce@wayneenterprises.com",
      username: "batman",
      password: "Batcave2025!",
      confirmPassword: "Batcave2025!",
      phone: "+1987654321",
      birthdate: "1985-02-19",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Diana",
      lastName: "Prince",
      age: 5000,
      email: "diana@themyscira.org",
      username: "wonderwoman",
      password: "LassoOfTruth!",
      confirmPassword: "LassoOfTruth!",
      phone: "+1987100000",
      birthdate: "0001-03-22",
      gender: "female",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Barry",
      lastName: "Allen",
      age: 28,
      email: "barry.allen@ccpd.com",
      username: "flash",
      password: "SpeedF0rce!",
      confirmPassword: "SpeedF0rce!",
      phone: "+1222333444",
      birthdate: "1996-09-01",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "Arthur",
      lastName: "Curry",
      age: 35,
      email: "arthur@atlantis.gov",
      username: "aquaman",
      password: "Tr1dentKing!",
      confirmPassword: "Tr1dentKing!",
      phone: "+1444555666",
      birthdate: "1989-11-29",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Victor",
      lastName: "Stone",
      age: 27,
      email: "victor.stone@starlabs.com",
      username: "cyborg",
      password: "Bo0mTube!",
      confirmPassword: "Bo0mTube!",
      phone: "+1999777888",
      birthdate: "1998-08-15",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "John",
      lastName: "Stewart",
      age: 34,
      email: "john.stewart@greenlanterns.org",
      username: "greenlantern",
      password: "PowerR1ng!",
      confirmPassword: "PowerR1ng!",
      phone: "+1888555777",
      birthdate: "1989-04-12",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Zatanna",
      lastName: "Zatara",
      age: 30,
      email: "zatanna@magicmail.com",
      username: "zatanna",
      password: "S1mpl3M4gic!",
      confirmPassword: "S1mpl3M4gic!",
      phone: "+1555444333",
      birthdate: "1995-12-05",
      gender: "female",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
    {
      firstName: "Kara",
      lastName: "Zor-El",
      age: 28,
      email: "kara@supergirl.tv",
      username: "supergirl",
      password: "KrYpt0nGirl!",
      confirmPassword: "KrYpt0nGirl!",
      phone: "+1333666777",
      birthdate: "1997-06-10",
      gender: "female",
      agreeToTerms: true,
      newsletterOptIn: false,
    },
    {
      firstName: "Billy",
      lastName: "Batson",
      age: 16,
      email: "billy@shazam.org",
      username: "shazam",
      password: "SHAZAM123!",
      confirmPassword: "SHAZAM123!",
      phone: "+1222111222",
      birthdate: "2009-05-03",
      gender: "male",
      agreeToTerms: true,
      newsletterOptIn: true,
    },
  ],
  notes: [
    {
      title: "Fix login bug",
      status: "in-progress",
      priority: "urgent",
      details:
        "<p>Fix the <strong>login redirect</strong> issue when users sign in with <em>Google</em>.</p>",
    },
    {
      title: "Design homepage banner",
      status: "todo",
      priority: "normal",
      details:
        "<p>Draft a <strong>hero banner</strong> with product highlights and <em>CTA button</em>.</p>",
    },
    {
      title: "Update user profile page",
      status: "completed",
      priority: "low",
      details:
        "<p>Cleaned up layout, added <em>mobile responsiveness</em>, and fixed avatar cropping.</p>",
    },
    {
      title: "Write API documentation",
      status: "in-progress",
      priority: "urgent",
      details:
        "<p>Document all <strong>POST endpoints</strong> and add code samples using <em>Axios</em>.</p>",
    },
    {
      title: "Implement dark mode",
      status: "todo",
      priority: "normal",
      details:
        "<p>Add a <strong>theme toggle</strong> in settings. Use <code>localStorage</code> to persist preference.</p>",
    },
    {
      title: "Test payment gateway",
      status: "completed",
      priority: "urgent",
      details:
        "<p>Verified <strong>Stripe integration</strong> and added sandbox card support.</p>",
    },
    {
      title: "Organize team retro",
      status: "todo",
      priority: "low",
      details:
        "<p>Schedule a <em>retrospective meeting</em> and prep a Miro board.</p>",
    },
    {
      title: "Migrate to TypeScript",
      status: "in-progress",
      priority: "normal",
      details:
        "<p>Convert all <strong>React components</strong> to <code>.tsx</code>. Address type errors as needed.</p>",
    },
    {
      title: "Fix broken footer links",
      status: "todo",
      priority: "low",
      details:
        "<p>Audit all <strong>external links</strong> and update with correct targets.</p>",
    },
    {
      title: "Create onboarding emails",
      status: "completed",
      priority: "normal",
      details:
        "<p>Designed <strong>3-step welcome series</strong> with Mailchimp. Includes HTML + plain text versions.</p>",
    },
  ],
};
