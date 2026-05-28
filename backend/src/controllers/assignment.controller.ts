import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { questionQueue } from '../queue/queue';
import { createAssignmentSchema } from '../validators/assignment.validator';
import fs from 'fs';
import path from 'path';

/**
 * @route   POST /api/assignments
 * @desc    Create a new assignment, validate input using Zod, and enqueue the background generation worker
 * @access  Public
 */
export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Pre-parse questionTypes if incoming payload is in multipart/form-data string format
    if (typeof req.body.questionTypes === 'string') {
      try {
        req.body.questionTypes = JSON.parse(req.body.questionTypes);
      } catch (e) {
        res.status(400).json({ error: 'Invalid questionTypes format. Expected a valid JSON array.' });
        return;
      }
    }

    // 2. Validate parsed request body using our strongly-typed Zod Schema
    const validationResult = createAssignmentSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map(err => err.message).join(', ');
      res.status(400).json({ error: errorMsg });
      return;
    }

    const validatedData = validationResult.data;

    // 3. Handle physical file attachment path if provided
    let uploadedFileUrl = '';
    if (req.file) {
      uploadedFileUrl = req.file.path;
    }

    // 4. Save initial document to database (metadata like class, title, subject will be filled asynchronously by the AI worker)
    const assignment = new Assignment({
      dueDate: validatedData.dueDate,
      schoolName: validatedData.schoolName,
      questionTypes: validatedData.questionTypes,
      additionalInstructions: validatedData.additionalInstructions,
      uploadedFileUrl,
      status: 'PENDING',
    });

    await assignment.save();
    console.log(`📝 [db] Saved PENDING assignment record: ${assignment._id}`);

    // 5. Enqueue background compilation task via BullMQ queue
    await questionQueue.add('generate', { assignmentId: assignment._id.toString() });
    console.log(`🚀 [queue] Enqueued job for assignment ID: ${assignment._id}`);

    res.status(202).json({
      message: 'Assignment successfully created and generation enqueued.',
      assignment,
    });
  } catch (error: any) {
    console.error('❌ [controller] Error in createAssignment:', error);
    res.status(500).json({ error: error?.message || 'Failed to create assignment.' });
  }
};

/**
 * @route   GET /api/assignments
 * @desc    Fetch a list of all saved assessments sorted chronologically
 * @access  Public
 */
export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error: any) {
    console.error('❌ [controller] Error in getAssignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
};

/**
 * @route   GET /api/assignments/:id
 * @desc    Fetch detailed information about a specific assessment by its Mongoose ID
 * @access  Public
 */
export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
       res.status(404).json({ error: 'Assignment not found.' });
       return;
    }

    res.status(200).json(assignment);
  } catch (error: any) {
    console.error('❌ [controller] Error in getAssignmentById:', error);
    res.status(500).json({ error: 'Failed to fetch assignment.' });
  }
};

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete an assignment record from the database and clean up any uploaded attachment on disk
 * @access  Public
 */
export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
       res.status(404).json({ error: 'Assignment not found.' });
       return;
    }

    // Clean up physical file reference from disk storage if present
    if (assignment.uploadedFileUrl) {
      const filePath = path.resolve(assignment.uploadedFileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ [fs] Cleaned up physical file from disk: ${filePath}`);
      }
    }

    await Assignment.findByIdAndDelete(id);
    res.status(200).json({ message: 'Assignment successfully deleted.' });
  } catch (error: any) {
    console.error('❌ [controller] Error in deleteAssignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
};

/**
 * @route   POST /api/assignments/:id/regenerate
 * @desc    Reset assignment generation payload and re-enqueue in BullMQ queue for AI processing
 * @access  Public
 */
export const regenerateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
       res.status(404).json({ error: 'Assignment not found.' });
       return;
    }

    // Reset generative parameters and update status to PENDING
    assignment.status = 'PENDING';
    assignment.error = undefined;
    assignment.generatedSections = undefined;
    assignment.answerKey = undefined;
    await assignment.save();

    // Enqueue new processing job in BullMQ
    await questionQueue.add('generate', { assignmentId: assignment._id.toString() });
    console.log(`🔄 [queue] Re-enqueued regeneration job for assignment ID: ${assignment._id}`);

    res.status(202).json({
      message: 'Regeneration successfully enqueued.',
      assignment,
    });
  } catch (error: any) {
    console.error('❌ [controller] Error in regenerateAssignment:', error);
    res.status(500).json({ error: 'Failed to regenerate assignment.' });
  }
};
