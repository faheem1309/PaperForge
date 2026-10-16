export type SourceRole = 'official_syllabus' | 'lecture_notes' | 'textbook' | 'previous_paper' | 'marking_scheme' | 'institution_template' | 'supporting_material';
export type SourceStatus = 'queued' | 'processing' | 'ready' | 'needs_review' | 'failed';

export interface SyllabusTopic {
  id: string;
  title: string;
  sourceDocumentId?: string;
  sourcePage?: number;
  children: SyllabusTopic[];
  approved: boolean;
  inferred: boolean;
}

export interface SourceDocument {
  id: string;
  name: string;
  format: string;
  sizeBytes: number;
  role: SourceRole;
  status: SourceStatus;
  extractedText: string;
  pageCount?: number;
  warnings: string[];
  addedAt: string;
  fingerprint: string;
  syllabusTopics: SyllabusTopic[];
}

export const SOURCE_ROLE_LABELS: Record<SourceRole, string> = {
  official_syllabus: 'Official syllabus',
  lecture_notes: 'Lecture notes',
  textbook: 'Textbook / chapter',
  previous_paper: 'Previous paper',
  marking_scheme: 'Marking scheme',
  institution_template: 'Institution template',
  supporting_material: 'Supporting material',
};
