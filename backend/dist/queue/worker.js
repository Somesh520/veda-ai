"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQueueWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const Assignment_1 = __importDefault(require("../models/Assignment"));
const gemini_service_1 = require("../services/gemini.service");
const socket_service_1 = require("../services/socket.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Initiates the BullMQ Question Generation Worker.
 * Listens to the 'question-generation' queue and processes incoming jobs.
 * Integrates PDF text extraction, AI generation model triggering, and real-time Socket.io updates.
 */
const initQueueWorker = () => {
    const worker = new bullmq_1.Worker('question-generation', async (job) => {
        const { assignmentId } = job.data;
        console.log(`👷 [worker] Processing job ${job.id} for Assignment ID: ${assignmentId}`);
        // 1. Fetch assignment record from MongoDB
        const assignment = await Assignment_1.default.findById(assignmentId);
        if (!assignment) {
            console.error(`👷 [worker] Assignment ${assignmentId} not found in DB.`);
            return;
        }
        try {
            // 2. Set status to GENERATING and notify connected clients via WebSockets
            assignment.status = 'GENERATING';
            await assignment.save();
            (0, socket_service_1.notifyAssignmentUpdate)(assignmentId, 'GENERATING');
            // 3. Extract text context from syllabus reference file if provided
            let fileContent = '';
            if (assignment.uploadedFileUrl) {
                const filePath = path_1.default.resolve(assignment.uploadedFileUrl);
                if (fs_1.default.existsSync(filePath)) {
                    const fileExtension = path_1.default.extname(filePath).toLowerCase();
                    console.log(`👷 [worker] Reading uploaded file context: ${filePath} (${fileExtension})`);
                    if (fileExtension === '.pdf') {
                        const fileBuffer = fs_1.default.readFileSync(filePath);
                        const pdfData = await (0, pdf_parse_1.default)(fileBuffer);
                        fileContent = pdfData.text;
                        console.log(`👷 [worker] Extracted PDF content: ${fileContent.length} characters.`);
                    }
                    else if (fileExtension === '.txt') {
                        fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
                        console.log(`👷 [worker] Extracted TXT content: ${fileContent.length} characters.`);
                    }
                    else {
                        console.log(`👷 [worker] Unsupported file format (${fileExtension}) for context extraction.`);
                    }
                }
                else {
                    console.warn(`👷 [worker] File not found on disk: ${filePath}`);
                }
            }
            // 4. Trigger Generative AI prompt builder (with failover groq model and mock backups)
            const aiResult = await (0, gemini_service_1.generateQuestionsAI)(assignment.questionTypes, assignment.additionalInstructions, fileContent);
            // 5. Update assignment state in DB with inferred metadata and generated sheets
            assignment.status = 'COMPLETED';
            assignment.title = aiResult.title || assignment.title;
            assignment.subject = aiResult.subject || assignment.subject;
            assignment.className = aiResult.className || assignment.className;
            assignment.timeAllowed = aiResult.timeAllowed || assignment.timeAllowed;
            assignment.generatedSections = aiResult.generatedSections;
            assignment.answerKey = aiResult.answerKey;
            await assignment.save();
            console.log(`👷 [worker] Generation successfully completed for Assignment: ${assignmentId}`);
            // 6. Broadcast successful completion payload to WebSocket rooms
            (0, socket_service_1.notifyAssignmentUpdate)(assignmentId, 'COMPLETED', assignment);
        }
        catch (error) {
            console.error(`❌ [worker] Failed to process Assignment ${assignmentId}:`, error);
            // Update DB with FAILED state and capture error description
            assignment.status = 'FAILED';
            assignment.error = error?.message || 'Unknown generation failure.';
            await assignment.save();
            // Broadcast failure notification via WebSockets
            (0, socket_service_1.notifyAssignmentUpdate)(assignmentId, 'FAILED', { error: assignment.error });
            throw error;
        }
    }, { connection: redis_1.redisConfig });
    // Success listener callback
    worker.on('completed', (job) => {
        console.log(`👷 [worker] Job ${job.id} finalized successfully!`);
    });
    // Error listener callback
    worker.on('failed', (job, err) => {
        console.error(`❌ [worker] Job ${job?.id} failed with error description:`, err);
    });
    console.log('👷 [worker] BullMQ Question Generation Worker started and listening.');
    return worker;
};
exports.initQueueWorker = initQueueWorker;
