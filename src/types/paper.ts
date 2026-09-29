export type EducationalTier = 'preschool' | 'secondary' | 'university';

export type QuestionType = 'mcq' | 'short' | 'long' | 'match' | 'case_study';

export type BloomLevel = 
  | 'Remember' 
  | 'Understand' 
  | 'Apply' 
  | 'Analyze' 
  | 'Evaluate' 
  | 'Create';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface McqOption {
  id: string;
  label: string; // 'A', 'B', 'C', 'D'
  text: string;
  isCorrect?: boolean;
}

export interface MatchPair {
  id: string;
  leftItem: string;
  rightItem: string;
  correctMatchIndex?: number;
}

export interface Question {
  id: string;
  code?: string; // e.g. "Q1" or "1(a)"
  text: string; // Rich text / LaTeX formatted string
  type: QuestionType;
  marks: number;
  bloomTaxonomy: BloomLevel;
  difficulty: DifficultyLevel;
  subjectCode: string;
  moduleUnit: string;
  courseOutcome?: string; // e.g. "CO1", "CO2"
  mcqOptions?: McqOption[];
  matchPairs?: MatchPair[];
  passageText?: string; // For case studies or comprehension
  hasInternalChoice?: boolean; // "OR" alternative
  alternativeQuestionText?: string;
  answerKeySolution?: string; // Explanation or step-marking rubric
  diagramUrl?: string; // Optional diagram
  diagramLabel?: string;
}

export interface Section {
  id: string;
  title: string; // e.g., "Section A: Multiple Choice Questions"
  instructions: string; // e.g., "Answer all questions. Each carries 1 mark."
  totalQuestionsToAttempt: number; // e.g., 5
  totalQuestionsAvailable: number; // e.g., 7 ("Answer any 5 out of 7")
  marksPerQuestion: number;
  expectedMarks: number;
  questions: Question[];
}

export interface PaperHeader {
  institutionName: string;
  tagline: string;
  affiliationCode: string;
  logoUrl?: string;
  examTitle: string; // e.g. "Annual Examination 2026" / "End Semester Examination"
  academicLevel: EducationalTier;
  subjectTitle: string;
  subjectCode: string;
  gradeSemester: string; // e.g. "Grade 10" or "B.Tech Semester VI"
  timeAllowedMinutes: number; // e.g., 180 (3 Hours)
  maximumMarks: number; // e.g., 100 or 80
  dateOfExam: string;
  showRegisterNumberBox: boolean;
  showSeatNumberGrid: boolean;
  showCourseOutcomeColumn: boolean;
  generalInstructions: string[];
}

export interface BlueprintConstraint {
  unitWeights: { [moduleUnit: string]: number }; // percentage e.g., "Unit 1": 30
  difficultyWeights: {
    Easy: number; // e.g. 30%
    Medium: number; // e.g. 50%
    Hard: number; // e.g. 20%
  };
  bloomDistribution: {
    [K in BloomLevel]?: number;
  };
}

export interface PaperDocument {
  id: string;
  header: PaperHeader;
  sections: Section[];
  pageFormat: 'A4' | 'Letter';
  fontFamily: 'Crimson Pro' | 'Times New Roman' | 'Arial' | 'Noto Sans';
  fontSize: 'compact' | 'normal' | 'large';
  watermarkText?: string; // e.g., "CONFIDENTIAL", "SAMPLE PAPER", ""
  watermarkOpacity: number; // 0 to 1
  showPageNumbers: boolean;
  twoColumnLayoutForMcqs: boolean;
  isAnswerKeyMode: boolean; // Render solutions & marking guides
  updatedAt: string;
}
