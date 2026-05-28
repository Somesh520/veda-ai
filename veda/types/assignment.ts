export interface IQuestionTypeOption {
  type: string;
  count: number;
  marksPerQuestion: number;
}

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

export interface IAssignment {
  _id: string;
  title: string;
  dueDate: string;
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
  createdAt: string;
}
