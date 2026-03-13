import { z } from "zod";

const callOutcomes = ["no_answer", "connected"] as const;
const meetingOutcomes = ["new_customer", "existing_customer"] as const;
const emailOutcomes = ["sent"] as const;

/** Zod schema for recording an activity (API input validation) */
export const recordActivitySchema = z.object({
  kind: z.enum(["call", "meeting", "email"]),
  outcome: z.union([
    z.enum(callOutcomes),
    z.enum(meetingOutcomes),
    z.enum(emailOutcomes),
  ]),
});

export type RecordActivityInput = z.infer<typeof recordActivitySchema>;
