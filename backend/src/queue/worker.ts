import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import Assignment from '../models/Assignment';
import { generateQuestionsAI } from '../services/gemini.service';
import { notifyAssignmentUpdate } from '../services/socket.service';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Initiates the BullMQ Question Generation Worker.
 * Listens to the 'question-generation' queue and processes incoming jobs.
 * Integrates PDF text extraction, AI generation model triggering, and real-time Socket.io updates.
 */
export const initQueueWorker = () => {
  const worker = new Worker(
    'question-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`👷 [worker] Processing job ${job.id} for Assignment ID: ${assignmentId}`);

      // 1. Fetch assignment record from MongoDB
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        console.error(`👷 [worker] Assignment ${assignmentId} not found in DB.`);
        return;
      }

      try {
        // 2. Set status to GENERATING and notify connected clients via WebSockets
        assignment.status = 'GENERATING';
        await assignment.save();
        notifyAssignmentUpdate(assignmentId, 'GENERATING');

        // 3. Extract text context from syllabus reference file if provided
        let fileContent = '';
        if (assignment.uploadedFileUrl) {
          const filePath = path.resolve(assignment.uploadedFileUrl);
          
          if (fs.existsSync(filePath)) {
            const fileExtension = path.extname(filePath).toLowerCase();
            console.log(`👷 [worker] Reading uploaded file context: ${filePath} (${fileExtension})`);
            
            if (fileExtension === '.pdf') {
              const fileBuffer = fs.readFileSync(filePath);
              const pdfData = await pdfParse(fileBuffer);
              fileContent = pdfData.text;
              console.log(`👷 [worker] Extracted PDF content: ${fileContent.length} characters.`);
            } else if (fileExtension === '.txt') {
              fileContent = fs.readFileSync(filePath, 'utf-8');
              console.log(`👷 [worker] Extracted TXT content: ${fileContent.length} characters.`);
            } else {
              console.log(`👷 [worker] Unsupported file format (${fileExtension}) for context extraction.`);
            }
          } else {
            console.warn(`👷 [worker] File not found on disk: ${filePath}`);
          }
        }

        // 4. Trigger Generative AI prompt builder (with failover groq model and mock backups)
        const aiResult = await generateQuestionsAI(
          assignment.questionTypes,
          assignment.additionalInstructions,
          fileContent
        );

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
        notifyAssignmentUpdate(assignmentId, 'COMPLETED', assignment.toJSON());
        
      } catch (error: any) {
        console.error(`❌ [worker] Failed to process Assignment ${assignmentId}:`, error);
        
        // Update DB with FAILED state and capture error description
        assignment.status = 'FAILED';
        assignment.error = error?.message || 'Unknown generation failure.';
        await assignment.save();
        
        // Broadcast failure notification via WebSockets
        notifyAssignmentUpdate(assignmentId, 'FAILED', { error: assignment.error });
        throw error;
      }
    },
    { connection: redisConfig }
  );

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
