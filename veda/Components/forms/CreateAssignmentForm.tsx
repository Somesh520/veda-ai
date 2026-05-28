'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useToast } from '../ui/Toast';
import VoiceInput from './VoiceInput';
import { 
  Upload, 
  Calendar, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface QuestionTypeRow {
  id: string;
  type: string;
  count: number;
  marksPerQuestion: number;
}

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
];

export default function CreateAssignmentForm() {
  const router = useRouter();
  const { createNewAssignment } = useAssessmentStore();
  const { showToast } = useToast();

  // 1. Due Date State
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleMonthPrev = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  };

  const handleMonthNext = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(calendarYear, calendarMonth, day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
    setShowDatePicker(false);
  };

  const getFormattedDueDate = () => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // 2. File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 3 & 4. Question Types Rows
  const [rows, setRows] = useState<QuestionTypeRow[]>([
    { id: '1', type: 'Multiple Choice Questions', count: 4, marksPerQuestion: 1 },
    { id: '2', type: 'Short Questions', count: 3, marksPerQuestion: 2 },
    { id: '3', type: 'Diagram/Graph-Based Questions', count: 5, marksPerQuestion: 5 },
    { id: '4', type: 'Numerical Problems', count: 5, marksPerQuestion: 5 },
  ]);

  // 5. Additional Instructions
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Submit & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // Row management
  const addRow = () => {
    const unselectedType = QUESTION_TYPES.find(t => !rows.map(r => r.type).includes(t)) || QUESTION_TYPES[0];
    setRows([...rows, { id: Date.now().toString(), type: unselectedType, count: 1, marksPerQuestion: 1 }]);
  };

  const deleteRow = (id: string) => {
    if (rows.length === 1) {
      setValidationError('At least one question type row is required!');
      return;
    }
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRowCounter = (id: string, field: 'count' | 'marksPerQuestion', delta: number) => {
    setRows(rows.map(r => {
      if (r.id !== id) return r;
      const val = field === 'count' ? r.count : r.marksPerQuestion;
      return { ...r, [field]: Math.max(1, val + delta) };
    }));
  };

  const handleRowTypeChange = (id: string, type: string) =>
    setRows(rows.map(r => r.id === id ? { ...r, type } : r));

  // Aggregates
  const totalQuestions = rows.reduce((s, r) => s + r.count, 0);
  const totalMarks = rows.reduce((s, r) => s + r.count * r.marksPerQuestion, 0);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!dueDate) {
      const msg = 'Due Date is required.';
      setValidationError(msg); showToast('warning', msg); return;
    }
    if (new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      const msg = 'Due Date cannot be in the past.';
      setValidationError(msg); showToast('warning', msg); return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dueDate', dueDate);
      formData.append('schoolName', 'Delhi Public School');
      formData.append('questionTypes', JSON.stringify(rows.map(r => ({
        type: r.type, count: r.count, marksPerQuestion: r.marksPerQuestion
      }))));
      formData.append('additionalInstructions', additionalInstructions);
      if (file) formData.append('file', file);

      const assignment = await createNewAssignment(formData);
      showToast('success', 'Assignment enqueued! AI generation has started.');
      router.push(`/assessment/${assignment._id}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit. Please try again.';
      setValidationError(msg); showToast('error', msg); setIsSubmitting(false);
    }
  };

  // Build calendar day cells
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const dayCells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) dayCells.push(<div key={`e-${i}`} />);
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(calendarYear, calendarMonth, day);
    const isToday = new Date().toDateString() === cellDate.toDateString();
    const isSelected = dueDate ? new Date(dueDate).toDateString() === cellDate.toDateString() : false;
    const isPast = cellDate < new Date(new Date().setHours(0, 0, 0, 0));
    dayCells.push(
      <button
        key={`d-${day}`}
        type="button"
        disabled={isPast}
        onClick={() => handleDateSelect(day)}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
          isSelected ? 'bg-orange-500 text-white shadow-sm'
          : isToday ? 'bg-slate-100 text-slate-800 border border-slate-300'
          : isPast ? 'text-slate-300 cursor-not-allowed'
          : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-8 max-w-4xl mx-auto pb-6 select-none">

      {/* Step progress bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Assignment details</h3>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Basic information about your assignment</p>
          </div>
        </div>
        <div className="w-20 sm:w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-slate-900 rounded-full" />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-sm">

        {/* A. File upload */}
        <div className="space-y-2">
          <div className={`flex items-center justify-center border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center transition-colors ${
            dragActive ? 'border-orange-300 bg-orange-50/30' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <input
              type="file"
              accept=".pdf,.txt,image/*"
              onChange={handleFileChange}
              id="file-upload-input"
              className="hidden"
            />
            {file ? (
              <div className="space-y-3 w-full">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[200px] mx-auto">{file.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-red-500 rounded-full px-4 py-1.5 cursor-pointer shadow-sm flex items-center gap-1 mx-auto"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag} onDragOver={handleDrag}
                onDragLeave={handleDrag} onDrop={handleDrop}
                className="space-y-3 w-full"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Choose a file or drag & drop</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">JPEG, PNG, PDF, TXT · max 10MB</p>
                </div>
                <label
                  htmlFor="file-upload-input"
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-full py-2.5 px-6 shadow-sm cursor-pointer inline-block transition-colors"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 text-center font-semibold">Upload images of your preferred document/image</p>
        </div>

        {/* B. Due Date — full width on mobile, max-md on desktop */}
        <div className="space-y-1.5 relative select-none">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due Date</span>
          </label>

          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full sm:max-w-md border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-medium outline-none transition-all shadow-sm bg-white cursor-pointer text-left flex items-center justify-between hover:bg-slate-50/50 active:scale-[0.99]"
          >
            <span className={getFormattedDueDate() ? 'text-slate-800' : 'text-slate-400'}>
              {getFormattedDueDate() || 'DD-MM-YYYY'}
            </span>
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Calendar popover — full width on mobile, fixed width on desktop */}
          {showDatePicker && (
            <div className="absolute left-0 right-0 sm:right-auto mt-2 p-4 sm:p-5 bg-white border border-slate-150 rounded-2xl sm:rounded-3xl shadow-xl z-30 animate-fade-in sm:w-72">
              {/* Month header */}
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handleMonthPrev} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {months[calendarMonth]} {calendarYear}
                </span>
                <button type="button" onClick={handleMonthNext} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="text-[10px] font-bold text-slate-400">{d}</span>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1 text-center">{dayCells}</div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold">
                <button type="button" onClick={() => { setDueDate(''); setShowDatePicker(false); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-1.5 px-3">
                  Clear
                </button>
                <button type="button"
                  onClick={() => {
                    const t = new Date();
                    setDueDate(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`);
                    setCalendarMonth(t.getMonth()); setCalendarYear(t.getFullYear()); setShowDatePicker(false);
                  }}
                  className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer py-1.5 px-3">
                  Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* C. Question Type rows — mobile-first layout */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Question Type</label>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 animate-fade-in relative">

                {/* Type selector + delete on same row */}
                <div className="flex items-center gap-2">
                  <select
                    value={row.type}
                    onChange={(e) => handleRowTypeChange(row.id, e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 focus:border-slate-300 outline-none cursor-pointer min-w-0"
                  >
                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50/50 transition-colors cursor-pointer shrink-0"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Counters row — side by side */}
                <div className="flex items-center gap-3">
                  {/* No. of Questions */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">No.</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateRowCounter(row.id, 'count', -1)}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors active:scale-90">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-extrabold text-slate-800 w-6 text-center">{row.count}</span>
                      <button type="button" onClick={() => updateRowCounter(row.id, 'count', 1)}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors active:scale-90">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Marks */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Marks</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateRowCounter(row.id, 'marksPerQuestion', -1)}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors active:scale-90">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-extrabold text-slate-800 w-6 text-center">{row.marksPerQuestion}</span>
                      <button type="button" onClick={() => updateRowCounter(row.id, 'marksPerQuestion', 1)}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors active:scale-90">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add row + totals */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 rounded-2xl py-3 px-5 font-semibold text-xs transition-all cursor-pointer hover:bg-slate-50 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question Type</span>
            </button>

            {/* Totals pill */}
            <div className="flex items-center justify-center sm:justify-end gap-4 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <span>Questions: <span className="text-slate-800 font-extrabold">{totalQuestions}</span></span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Marks: <span className="text-slate-800 font-extrabold">{totalMarks}</span></span>
            </div>
          </div>
        </div>

        {/* D. Additional instructions + voice input */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Additional Information <span className="text-slate-400 normal-case font-normal">(for better output)</span>
          </label>
          <textarea
            rows={4}
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-xs font-medium placeholder-slate-400 focus:border-slate-300 outline-none transition-all resize-none pr-14 bg-white text-slate-700 shadow-sm"
          />
          <VoiceInput onTranscript={(text) => setAdditionalInstructions(prev => prev + (prev ? ' ' : '') + text)} />
        </div>
      </div>

      {/* Validation error banner */}
      {validationError && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <span>❌ {validationError}</span>
        </div>
      )}

      {/* Navigation buttons — stacked on tiny screens, row on sm+ */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex-1 sm:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full py-3.5 px-6 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 px-6 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
