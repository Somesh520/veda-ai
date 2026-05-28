import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  deleteAssignment,
  regenerateAssignment,
} from '../controllers/assignment.controller';

const router = Router();

// Ensure the local file uploads storage directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure Multer disk storage engine to save files locally on disk
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

/**
 * Multer middleware with PDF/TXT/JPEG/PNG format filters and 10MB size limits
 */
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Enforce 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|txt|png|jpeg|jpg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, Text, JPEG, JPG, and PNG files are supported as syllabus references!'));
  },
});

/* ==========================================================================
   Assignment Routes Definition
   ========================================================================== */

/**
 * @route   POST /api/assignments
 * @desc    Submit a new assignment with dynamic question type criteria and optional reference syllabus file
 */
router.post('/', upload.single('file'), createAssignment);

/**
 * @route   GET /api/assignments
 * @desc    Retrieve all generated assignments sorted chronologically
 */
router.get('/', getAssignments);

/**
 * @route   GET /api/assignments/:id
 * @desc    Fetch specific assignment details by Mongoose ID
 */
router.get('/:id', getAssignmentById);

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Remove an assignment record and delete its syllabus reference from disk
 */
router.delete('/:id', deleteAssignment);

/**
 * @route   POST /api/assignments/:id/regenerate
 * @desc    Reset and re-enqueue an existing assignment for generative AI processing
 */
router.post('/:id/regenerate', regenerateAssignment);
export default router;
