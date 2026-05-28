"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const assignment_controller_1 = require("../controllers/assignment.controller");
const router = (0, express_1.Router)();
// Ensure the local file uploads storage directory exists
const uploadDir = './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
/**
 * Configure Multer disk storage engine to save files locally on disk
 */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
/**
 * Multer middleware with PDF/TXT/JPEG/PNG format filters and 10MB size limits
 */
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Enforce 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|txt|png|jpeg|jpg/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
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
router.post('/', upload.single('file'), assignment_controller_1.createAssignment);
/**
 * @route   GET /api/assignments
 * @desc    Retrieve all generated assignments sorted chronologically
 */
router.get('/', assignment_controller_1.getAssignments);
/**
 * @route   GET /api/assignments/:id
 * @desc    Fetch specific assignment details by Mongoose ID
 */
router.get('/:id', assignment_controller_1.getAssignmentById);
/**
 * @route   DELETE /api/assignments/:id
 * @desc    Remove an assignment record and delete its syllabus reference from disk
 */
router.delete('/:id', assignment_controller_1.deleteAssignment);
/**
 * @route   POST /api/assignments/:id/regenerate
 * @desc    Reset and re-enqueue an existing assignment for generative AI processing
 */
router.post('/:id/regenerate', assignment_controller_1.regenerateAssignment);
exports.default = router;
