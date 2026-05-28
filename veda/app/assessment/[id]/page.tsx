'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { connectSocket } from '../../../services/socket';
import { useToast } from '../../../Components/ui/Toast';
import { 
  ArrowLeft, 
  Download, 
  RotateCw, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AssessmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const { 
    currentAssignment, 
    isLoading, 
    loadAssignmentById, 
    triggerRegeneration, 
    updateAssignmentStatus 
  } = useAssessmentStore();

  const { showToast, showConfirm } = useToast();
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Live Terminal Ticker State and Data
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerLines = [
    '⏳ [queue] Enqueued job in Redis BullMQ queue...',
    '📦 [db] Fetched assignment criteria configurations...',
    '📄 [context] Checking for attached syllabus PDF reference...',
    '✂️ [context] Extracted reference text successfully.',
    '🤖 [gemini] Invoking primary generative engine: gemini-1.5-flash...',
    '⚖️ [gemini] Synthesizing difficulty distribution parameters...',
    '📊 [gemini] Formulating question matrix & section headers...',
    '✒️ [cbse] Aligning dotted student fields (Name, Roll No, Section)...',
    '🔑 [answer_key] Drafting correct answer keys and grading solutions...',
    '✅ [compiler] Generation finalized. Rendering vector-perfect sheet...'
  ];

  // Helper to resolve stage status dynamically based on BullMQ status
  const getStageStatus = (stageIndex: number, currentStatus: string) => {
    if (stageIndex === 1) {
      return 'completed';
    }
    if (stageIndex === 2) {
      if (currentStatus === 'PENDING') return 'active';
      return 'completed';
    }
    if (stageIndex === 3) {
      if (currentStatus === 'PENDING') return 'pending';
      if (currentStatus === 'GENERATING') return 'active';
      return 'completed';
    }
    if (stageIndex === 4) {
      if (currentStatus === 'COMPLETED') return 'completed';
      if (currentStatus === 'GENERATING') return 'active';
      return 'pending';
    }
    if (stageIndex === 5) {
      if (currentStatus === 'COMPLETED') return 'completed';
      return 'pending';
    }
    return 'pending';
  };

  // Sync state via WebSockets
  useEffect(() => {
    if (!assignmentId) return;

    // First load from API
    loadAssignmentById(assignmentId).catch((err) => {
      console.error('Failed to load assignment:', err);
    });

    // Establish WebSocket Connection
    console.log(`🔌 Initializing WebSockets connection for: ${assignmentId}`);
    const socket = connectSocket(assignmentId, (update) => {
      console.log('📡 Reactive WebSocket payload received:', update);
      if (update.status) {
        updateAssignmentStatus(assignmentId, update.status as any, update.data);
      }
    });

    return () => {
      console.log('🔌 Cleaning up WebSockets connection.');
      socket.disconnect();
    };
  }, [assignmentId, loadAssignmentById, updateAssignmentStatus]);

  // Real-time simulated log ticker loop
  useEffect(() => {
    if (!currentAssignment || (currentAssignment.status !== 'PENDING' && currentAssignment.status !== 'GENERATING')) {
      return;
    }
    
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev < tickerLines.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, [currentAssignment]);

  // Download PDF Trigger using native print vector
  const handleDownloadPDF = () => {
    window.print();
  };

  const handleRegenerate = () => {
    showConfirm({
      title: 'Regenerate Assessment',
      message: 'Are you sure you want to regenerate this assignment using AI? This will replace the existing questions with newly synthesized content.',
      confirmText: 'Regenerate',
      cancelText: 'Cancel',
      variant: 'warning',
      onConfirm: async () => {
        setTickerIndex(0); // Reset progress ticker log!
        await triggerRegeneration(assignmentId);
        showToast('info', 'AI generation restarted successfully!');
      }
    });
  };

  if (isLoading && !currentAssignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Fetching details...</p>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Assignment not found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested assignment details could not be loaded.</p>
        <Link href="/" className="bg-slate-900 text-white rounded-full px-6 py-2.5 font-bold text-xs">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { status, title, subject, className, timeAllowed, schoolName, generatedSections, answerKey, error } = currentAssignment;
  
  // Calculate total marks
  const calculatedTotalMarks = generatedSections
    ? generatedSections.reduce((sum, sec) => sum + sec.questions.reduce((s, q) => s + q.marks, 0), 0)
    : currentAssignment.questionTypes.reduce((sum, r) => sum + (r.count * r.marksPerQuestion), 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Main details area — tighter padding on mobile */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* LOADING & JOB STATE SCREENS */}
        {status !== 'COMPLETED' && status !== 'FAILED' && (
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-10 min-h-[360px] sm:min-h-[460px] no-print">
            
            {/* Left Column: Premium SVG Sheet Building Animation */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 max-w-full md:max-w-[340px] w-full relative overflow-hidden group select-none">
              <div className="absolute inset-0 bg-radial-gradient from-orange-500/5 via-transparent to-transparent animate-pulse"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Visual SVG Animation Sheet */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-orange-100/50 rounded-full blur-2xl animate-pulse"></div>
                  
                  {/* Styled CBSE Sheet being drafted */}
                  <svg className="w-32 h-32 relative z-10 filter drop-shadow-md" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="5" width="80" height="110" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="3" />
                    
                    {/* Header lines */}
                    <line x1="25" y1="20" x2="75" y2="20" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                    <line x1="35" y1="30" x2="65" y2="30" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Pulsing AI Sparkle Badge */}
                    <path d="M50 48L53 58L63 61L53 64L50 74L47 64L37 61L47 58Z" fill="#F97316" className="animate-pulse origin-center scale-75" />
                    
                    {/* Standard dotted lines (drawing effect) */}
                    <line x1="25" y1="85" x2="75" y2="85" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
                    <line x1="25" y1="95" x2="60" y2="95" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  
                  {/* Floating particles/icons */}
                  <div className="absolute top-4 left-6 animate-bounce">
                    <Sparkles className="w-5 h-5 text-orange-500 fill-orange-100" />
                  </div>
                  <div className="absolute bottom-6 right-6 animate-pulse">
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  </div>
                </div>
                
                {/* Pulsing state bar */}
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-100/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                    {status === 'PENDING' ? 'Queued' : 'Synthesizing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Progressive Checklist & Live Terminal Ticker */}
            <div className="flex-[1.5] w-full flex flex-col justify-between self-stretch py-2">
              <div className="space-y-6">
                {/* Header title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                    {status === 'PENDING' ? 'Job Initiated' : 'Compiling Assignment Criteria...'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                    Our background system is analyzing your requested questions matrix. We divide generation steps to guarantee robust layout compliance.
                  </p>
                </div>

                {/* Progress stages checklist */}
                <div className="space-y-3.5">
                  {[
                    { id: 1, label: 'Connecting to Redis BullMQ service' },
                    { id: 2, label: 'Scanning local storage for syllabus references' },
                    { id: 3, label: 'Invoking Google Gemini AI parsing engine' },
                    { id: 4, label: 'Applying strict CBSE Section guidelines & dotted lines' },
                    { id: 5, label: 'Drafting structured question keys & solution guides' }
                  ].map((stage) => {
                    const stageState = getStageStatus(stage.id, status);
                    return (
                      <div key={stage.id} className="flex items-center gap-3">
                        {/* Checkmark or spinner */}
                        {stageState === 'completed' ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" />
                          </div>
                        ) : stageState === 'active' ? (
                          <div className="w-5 h-5 rounded-full bg-orange-50 border border-orange-150 flex items-center justify-center text-orange-500 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                            <span className="text-[9px] font-bold">{stage.id}</span>
                          </div>
                        )}
                        
                        <span className={`text-xs font-semibold ${
                          stageState === 'completed' 
                            ? 'text-slate-500 line-through decoration-slate-200' 
                            : stageState === 'active'
                            ? 'text-slate-800 font-bold animate-pulse'
                            : 'text-slate-400'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Scrolling Terminal Ticker Log */}
              <div className="mt-5 sm:mt-8 border border-slate-800 bg-slate-900 rounded-2xl p-3.5 sm:p-4 font-mono text-[10px] text-slate-400 shadow-inner flex flex-col gap-1.5 select-text">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2 mb-1.5">
                  <span className="font-bold uppercase tracking-wider">Live System Logs Compiler</span>
                  <span className="bg-slate-855 px-2 py-0.5 rounded text-[8px] font-bold text-orange-400">ACTIVE</span>
                </div>
                
                {/* Print previous logs up to the active ticker index */}
                <div className="space-y-1 overflow-y-auto max-h-[75px]">
                  {tickerLines.slice(0, tickerIndex + 1).map((line, idx) => (
                    <div key={idx} className="animate-fade-in truncate">
                      <span className="text-slate-500 mr-1.5">[{new Date().toLocaleTimeString('en-GB')}]</span>
                      <span className={idx === tickerIndex ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* FAILED STATE SCREEN */}
        {status === 'FAILED' && (
          <div className="bg-white border border-red-100 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] no-print">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">AI Generation Failed</h2>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed mb-6 font-medium">
              We encountered an issue while communicating with Gemini AI: <span className="text-red-500 font-bold block mt-1">{error || 'Unknown error'}</span>
            </p>
            <button
              onClick={handleRegenerate}
              className="bg-slate-900 text-white rounded-full py-2.5 px-6 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* COMPLETED ASSESSMENT - High Fidelity Print sheet */}
        {status === 'COMPLETED' && (
          <div className="space-y-6">
            
            {/* Alert banner on top */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6.5 shadow-sm no-print relative overflow-hidden flex items-start gap-4">
              <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 text-slate-800/20">
                <Sparkles className="w-32 h-32" />
              </div>
              
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-inner">
                <CheckCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div className="relative z-10 flex-1">
                <p className="text-xs leading-relaxed text-slate-200">
                  Certainly, Lakshya! Here is the customized Question Paper for your <span className="font-bold text-white">{subject}</span> classes on the NCERT chapters:
                </p>
              </div>
            </div>

            {/* Action Bar (Download & Regenerate) — wraps on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 no-print pt-2">
              <button
                onClick={handleRegenerate}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full py-3 sm:py-2.5 px-5 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.98]"
              >
                <RotateCw className="w-4 h-4 text-slate-400" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white rounded-full py-3 sm:py-2.5 px-6 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] border-2 border-orange-500 shadow-md"
              >
                <Download className="w-4 h-4 text-white fill-white" />
                <span>Download as PDF</span>
              </button>
            </div>

            {/* CBSE Printed Paper Page container — reduced padding on mobile */}
            <div 
              ref={printRef}
              className="bg-white border border-slate-150 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 lg:p-12 shadow-sm relative print-area select-none font-serif text-black leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {/* Exam Header */}
              <div className="text-center space-y-1.5 sm:space-y-2 border-b-2 border-slate-900 pb-4 sm:pb-6 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight uppercase text-black">{schoolName}</h2>
                <h3 className="text-base sm:text-lg font-bold text-slate-700">Subject: {subject}</h3>
                <h4 className="text-sm sm:text-base font-bold text-slate-500">Class: {className}</h4>
                
                <div className="flex items-center justify-between text-xs font-bold pt-4 text-slate-600 uppercase" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                  <span>Time Allowed: {timeAllowed}</span>
                  <span>Maximum Marks: {calculatedTotalMarks}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="border-b border-slate-300 pb-4 mb-6 text-xs text-slate-600 font-bold" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                <p>All questions are compulsory unless stated otherwise.</p>
              </div>

              {/* Student details dotted fields (Figma exact match) */}
              <div className="space-y-3.5 text-base text-black mb-8 pb-6 border-b-4 border-black select-text" style={{ fontFamily: 'Georgia, serif' }}>
                <div className="flex items-center">
                  <span className="font-bold">Name:</span>
                  <span className="border-b border-black w-56 ml-1.5 h-4"></span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">Roll Number:</span>
                  <span className="border-b border-black w-48 ml-1.5 h-4"></span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">Class: {className} Section:</span>
                  <span className="border-b border-black w-24 ml-1.5 h-4"></span>
                </div>
              </div>

              {/* Dynamic generated sections */}
              <div className="space-y-12">
                {generatedSections?.map((section) => {
                  // Split instruction into a bold description title and italicized guidelines
                  const parts = section.instruction.split('. ');
                  const secHeaderTitle = parts[0] || 'Questions';
                  const secGuidelines = parts.slice(1).join('. ') || 'Attempt all questions.';
                  
                  return (
                    <div key={section.title} className="space-y-6">
                      {/* Section Header (Figma exact match) */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-black uppercase tracking-wider">{section.title}</h3>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-black">{secHeaderTitle}</h4>
                          <p className="text-sm italic text-slate-700">
                            {secGuidelines}
                          </p>
                        </div>
                      </div>

                      {/* Questions List (Georgia Serif plain text style matching image exactly) */}
                      <ol className="space-y-3.5 text-[15px] text-black list-decimal pl-6 select-text leading-relaxed">
                        {section.questions.map((q, qIndex) => (
                          <li key={qIndex} className="pl-1">
                            <span>[{q.difficulty}]</span>{' '}
                            <span>{q.text}</span>{' '}
                            <span>[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>

              {/* End Of Exam Sheet Dotted Line */}
              <div className="font-bold text-sm text-black mt-12 mb-10">
                End of Question Paper
              </div>

              {/* Answer Key printed directly on the sheet (Figma exact match) */}
              {answerKey && answerKey.length > 0 && (
                <div className="pt-8 border-t border-slate-350 mt-10 space-y-4">
                  <h3 className="font-bold text-base text-black">Answer Key:</h3>
                  <ol className="space-y-4 text-[14px] text-slate-800 list-decimal pl-6 select-text leading-relaxed">
                    {answerKey.map((item, keyIdx) => (
                      <li key={keyIdx} className="pl-1 font-medium whitespace-pre-line">
                        {item.answer}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* 3. ANSWER KEY SECTION - Collapsible Accordion layout */}
            {answerKey && answerKey.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm no-print">
                <button
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className="w-full flex items-center justify-between font-bold text-slate-800 text-sm cursor-pointer select-none"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span>Answer Key & Detailed Marking Guidelines</span>
                  </span>
                  
                  {showAnswerKey ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {showAnswerKey && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 text-xs leading-relaxed animate-fade-in select-text">
                    <div className="grid grid-cols-1 gap-4">
                      {answerKey.map((item, keyIdx) => (
                        <div key={keyIdx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Question {item.questionNumber}</span>
                            <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-md">{item.section}</span>
                          </div>
                          <p className="font-semibold text-slate-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
