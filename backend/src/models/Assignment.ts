import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswerKeyItem {
  questionNumber: number;
  section: string;
  answer: string;
}

export interface IQuestionTypeOption {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  questionTypes: IQuestionTypeOption[];
  additionalInstructions?: string;
  uploadedFileUrl?: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  error?: string;
  generatedSections?: ISection[];
  answerKey?: IAnswerKeyItem[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const AnswerKeyItemSchema = new Schema<IAnswerKeyItem>({
  questionNumber: { type: Number, required: true },
  section: { type: String, required: true },
  answer: { type: String, required: true },
});

const QuestionTypeOptionSchema = new Schema<IQuestionTypeOption>({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },
});

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, default: 'AI Generated Assessment' },
  dueDate: { type: Date, required: true },
  schoolName: { type: String, required: true, default: 'Delhi Public School' },
  subject: { type: String, default: 'General Studies' },
  className: { type: String, default: '8th Grade' },
  timeAllowed: { type: String, default: '45 minutes' },
  questionTypes: [QuestionTypeOptionSchema],
  additionalInstructions: { type: String },
  uploadedFileUrl: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING',
    required: true
  },
  error: { type: String },
  generatedSections: [SectionSchema],
  answerKey: [AnswerKeyItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
