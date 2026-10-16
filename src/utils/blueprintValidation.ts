import { Section, Question } from '../types/paper';

export interface BlueprintIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  sectionId?: string;
}

export interface BlueprintQualityReport {
  plannedMarks: number;
  attainableMarks: number;
  printedMarks: number;
  filledQuestionCount: number;
  expectedQuestionCount: number;
  duplicateQuestionIds: string[];
  issues: BlueprintIssue[];
  coverage: { label: string; count: number; marks: number }[];
  difficulty: { label: string; count: number; marks: number }[];
  questionTypes: { label: string; count: number; marks: number }[];
}

const normalise = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
const aggregate = (questions: Question[], key: (question: Question) => string) => {
  const map = new Map<string, { label: string; count: number; marks: number }>();
  questions.forEach(question => {
    const label = key(question) || 'Unspecified';
    const existing = map.get(label) || { label, count: 0, marks: 0 };
    existing.count += 1;
    existing.marks += question.marks;
    map.set(label, existing);
  });
  return Array.from(map.values()).sort((a, b) => b.marks - a.marks);
};

export function validateBlueprint(sections: Section[], maximumMarks: number): BlueprintQualityReport {
  const questions = sections.flatMap(section => section.questions);
  const plannedMarks = sections.reduce((sum, section) => sum + section.totalQuestionsToAttempt * section.marksPerQuestion, 0);
  const attainableMarks = plannedMarks;
  const printedMarks = sections.reduce((sum, section) => sum + section.totalQuestionsAvailable * section.marksPerQuestion, 0);
  const issues: BlueprintIssue[] = [];

  sections.forEach(section => {
    if (section.totalQuestionsToAttempt > section.totalQuestionsAvailable) {
      issues.push({ severity: 'error', code: 'ATTEMPT_GT_AVAILABLE', sectionId: section.id, message: `${section.title}: students are asked to attempt ${section.totalQuestionsToAttempt}, but only ${section.totalQuestionsAvailable} questions are printed.` });
    }
    if (section.totalQuestionsToAttempt < 1 || section.totalQuestionsAvailable < 1 || section.marksPerQuestion < 1) {
      issues.push({ severity: 'error', code: 'INVALID_SECTION_VALUE', sectionId: section.id, message: `${section.title}: question counts and marks must all be at least 1.` });
    }
    if (section.questions.length > section.totalQuestionsAvailable) {
      issues.push({ severity: 'error', code: 'SECTION_OVERFILLED', sectionId: section.id, message: `${section.title}: ${section.questions.length} questions are placed, but the section capacity is ${section.totalQuestionsAvailable}.` });
    }
    if (section.questions.length < section.totalQuestionsAvailable) {
      issues.push({ severity: 'warning', code: 'SECTION_INCOMPLETE', sectionId: section.id, message: `${section.title}: ${section.totalQuestionsAvailable - section.questions.length} printed question slot(s) still need content.` });
    }
    const mismatched = section.questions.filter(question => question.marks !== section.marksPerQuestion);
    if (mismatched.length > 0) {
      issues.push({ severity: 'warning', code: 'MARK_MISMATCH', sectionId: section.id, message: `${section.title}: ${mismatched.length} question(s) have marks that differ from the section rule (${section.marksPerQuestion}).` });
    }
  });

  if (plannedMarks !== maximumMarks) {
    issues.push({ severity: 'error', code: 'TOTAL_MARK_MISMATCH', message: `The attainable total is ${plannedMarks} marks, but the examination maximum is ${maximumMarks}.` });
  }
  if (printedMarks < maximumMarks) {
    issues.push({ severity: 'warning', code: 'PRINTED_MARKS_LOW', message: `The printed question pool is only ${printedMarks} marks, below the configured maximum of ${maximumMarks}.` });
  }

  const byText = new Map<string, string[]>();
  questions.forEach(question => {
    const key = normalise(question.text);
    if (!key) return;
    byText.set(key, [...(byText.get(key) || []), question.id]);
  });
  const duplicateQuestionIds = Array.from(byText.values()).filter(ids => ids.length > 1).flat();
  if (duplicateQuestionIds.length) {
    issues.push({ severity: 'error', code: 'DUPLICATE_QUESTIONS', message: `${duplicateQuestionIds.length} question entries have exact duplicate wording. Remove or rewrite duplicates before approval.` });
  }
  if (!questions.length) issues.push({ severity: 'warning', code: 'NO_QUESTIONS', message: 'No questions have been placed in the paper yet.' });

  return {
    plannedMarks,
    attainableMarks,
    printedMarks,
    filledQuestionCount: questions.length,
    expectedQuestionCount: sections.reduce((sum, section) => sum + section.totalQuestionsAvailable, 0),
    duplicateQuestionIds,
    issues,
    coverage: aggregate(questions, question => question.moduleUnit),
    difficulty: aggregate(questions, question => question.difficulty),
    questionTypes: aggregate(questions, question => question.type),
  };
}
