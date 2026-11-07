import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    /** Short TOC label, defaults to the title */
    label: z.string().optional(),
    order: z.number(),
    /** Name of the live demo rendered above the section's text */
    demo: z.string().optional(),
  }),
});

export const collections = { docs };
