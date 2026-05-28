import { z } from 'zod';

/**
 * Zod Schema for incoming Create Assignment requests.
 * Performs deep type checks and pre-processing conversions for request validation.
 */
export const createAssignmentSchema = z.object({
  // Pre-process date strings into standard JavaScript Date objects
  dueDate: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') {
      return new Date(val);
    }
    return val;
  }, z.date({
    message: "Due Date must be a valid date",
  })),

  // Default school name to Delhi Public School if not explicitly provided
  schoolName: z.string().optional().default('Delhi Public School'),

  // Matrix array of requested question type criteria rows
  questionTypes: z.array(
    z.object({
      type: z.string().min(1, 'Question type label is required'),
      count: z.number().int().positive('Number of questions must be a positive integer'),
      marksPerQuestion: z.number().int().positive('Marks per question must be a positive integer'),
    }),
    { message: "Question Types configuration is required" }
  ).min(1, 'At least one Question Type row is required'),

  // Optional string field for voice transcripts or extra prompts
  additionalInstructions: z.string().optional(),
});
