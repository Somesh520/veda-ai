"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod Schema for incoming Create Assignment requests.
 * Performs deep type checks and pre-processing conversions for request validation.
 */
exports.createAssignmentSchema = zod_1.z.object({
    // Pre-process date strings into standard JavaScript Date objects
    dueDate: zod_1.z.preprocess((val) => {
        if (typeof val === 'string' && val.trim() !== '') {
            return new Date(val);
        }
        return val;
    }, zod_1.z.date({
        message: "Due Date must be a valid date",
    })),
    // Default school name to Delhi Public School if not explicitly provided
    schoolName: zod_1.z.string().optional().default('Delhi Public School'),
    // Matrix array of requested question type criteria rows
    questionTypes: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string().min(1, 'Question type label is required'),
        count: zod_1.z.number().int().positive('Number of questions must be a positive integer'),
        marksPerQuestion: zod_1.z.number().int().positive('Marks per question must be a positive integer'),
    }), { message: "Question Types configuration is required" }).min(1, 'At least one Question Type row is required'),
    // Optional string field for voice transcripts or extra prompts
    additionalInstructions: zod_1.z.string().optional(),
});
