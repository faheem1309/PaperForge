import React from 'react';
import { Section, Question, BloomLevel } from '../types/paper';
import { MathRenderer } from '../utils/latexHelper';
import { 
  Plus, 
  Trash2, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  Split, 
  FileText,
  CornerDownRight
} from 'lucide-react';

interface BlueprintBuilderProps {
  sections: Section[];
  maxPaperMarks: number;
  onSectionsChange: (updated: Section[]) => void;
  onOpenQuestionBank: (targetSectionId: string) => void;
  onOpenAutoGenerator: () => void;
  onEditQuestion: (sectionId: string, question: Question) => void;
}

const BLOOM_COLORS: Record<BloomLevel, string> = {
  Remember: 'text-sky-700 bg-sky-50 border-sky-200',
  Understand: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Apply: 'text-amber-700 bg-amber-50 border-amber-200',
  Analyze: 'text-purple-700 bg-purple-50 border-purple-200',
  Evaluate: 'text-rose-700 bg-rose-50 border-rose-200',
  Create: 'text-indigo-700 bg-indigo-50 border-indigo-200',
};

export const BlueprintBuilder: React.FC<BlueprintBuilderProps> = ({
  sections,
  maxPaperMarks,
  onSectionsChange,
  onOpenQuestionBank,
  onOpenAutoGenerator,
  onEditQuestion,
}) => {
  // Calculate planned marks from sections: sum of (totalQuestionsToAttempt * marksPerQuestion)
  const plannedMarks = sections.reduce(
    (sum, sec) => sum + (sec.totalQuestionsToAttempt * sec.marksPerQuestion),
    0
  );

  // Actual marks of all currently placed questions (considering questions to attempt)
  const currentTotalQuestions = sections.reduce((sum, sec) => sum + sec.questions.length, 0);

  const marksDelta = plannedMarks - maxPaperMarks;
  const isReconciled = marksDelta === 0;

  const handleAddSection = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLetter = letters[sections.length] || `S${sections.length + 1}`;
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      title: `SECTION ${nextLetter}: DESCRIPTIVE QUESTIONS`,
      instructions: 'Answer all questions. Each carries 5 marks.',
      totalQuestionsToAttempt: 2,
      totalQuestionsAvailable: 2,
      marksPerQuestion: 5,
      expectedMarks: 10,
      questions: [],
    };
    onSectionsChange([...sections, newSection]);
  };

  const handleRemoveSection = (sectionId: string) => {
    onSectionsChange(sections.filter(s => s.id !== sectionId));
  };

  const handleUpdateSection = <K extends keyof Section>(
    sectionId: string,
    field: K,
    val: Section[K]
  ) => {
    onSectionsChange(
      sections.map(sec => {
        if (sec.id === sectionId) {
          const updated = { ...sec, [field]: val };
          // If totalQuestionsToAttempt or marksPerQuestion changed, recalculate expectedMarks
          if (field === 'totalQuestionsToAttempt' || field === 'marksPerQuestion') {
            updated.expectedMarks = updated.totalQuestionsToAttempt * updated.marksPerQuestion;
          }
          return updated;
        }
        return sec;
      })
    );
  };

  const handleRemoveQuestionFromSection = (sectionId: string, questionId: string) => {
    onSectionsChange(
      sections.map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            questions: sec.questions.filter(q => q.id !== questionId),
          };
        }
        return sec;
      })
    );
  };

  const handleMoveQuestion = (sectionId: string, index: number, direction: 'up' | 'down') => {
    onSectionsChange(
      sections.map(sec => {
        if (sec.id === sectionId) {
          const newQuestions = [...sec.questions];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex >= 0 && targetIndex < newQuestions.length) {
            const temp = newQuestions[index];
            newQuestions[index] = newQuestions[targetIndex];
            newQuestions[targetIndex] = temp;
          }
          return { ...sec, questions: newQuestions };
        }
        return sec;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Live Mark Reconciliation Banner */}
      <div className={`p-4 rounded-xl border transition-colors ${
        isReconciled 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {isReconciled ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>Automatic Mark Reconciliation</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80 border border-current">
                  {plannedMarks} / {maxPaperMarks} Marks
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isReconciled ? (
                  'Blueprint rules perfectly match the target examination maximum marks.'
                ) : marksDelta > 0 ? (
                  `Surplus detected: Section blueprint offers +${marksDelta} marks more than paper maximum (${maxPaperMarks} Marks).`
                ) : (
                  `Deficit detected: Section blueprint is short by ${Math.abs(marksDelta)} marks from target (${maxPaperMarks} Marks).`
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAutoGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Blueprint Generator
            </button>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Academic Sections & Blueprint Rules ({sections.length} Sections)
            </h3>
            <p className="text-xs text-slate-500">Configure choice parameters, marks per question, and question pools</p>
          </div>
          <button
            type="button"
            onClick={handleAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Section
          </button>
        </div>

        {sections.map((section, sIndex) => {
          const sectionMarks = section.totalQuestionsToAttempt * section.marksPerQuestion;
          const questionCount = section.questions.length;
          const isSlotFull = questionCount >= section.totalQuestionsAvailable;

          return (
            <div
              key={section.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
            >
              {/* Section Header Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex-1">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none bg-transparent py-0.5"
                    placeholder="Section Title e.g. PART A: MULTIPLE CHOICE QUESTIONS"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Weight: {sectionMarks} Marks ({section.totalQuestionsToAttempt} × {section.marksPerQuestion}M)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Instructions and Rules */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="md:col-span-4">
                  <label className="block text-slate-600 mb-1 font-medium">Candidate Section Instructions</label>
                  <input
                    type="text"
                    value={section.instructions}
                    onChange={(e) => handleUpdateSection(section.id, 'instructions', e.target.value)}
                    placeholder="e.g. Answer any 4 questions. Each question carries 5 marks."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Questions to Attempt</label>
                  <input
                    type="number"
                    min="1"
                    value={section.totalQuestionsToAttempt}
                    onChange={(e) => handleUpdateSection(section.id, 'totalQuestionsToAttempt', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Total Questions in Paper</label>
                  <input
                    type="number"
                    min="1"
                    value={section.totalQuestionsAvailable}
                    onChange={(e) => handleUpdateSection(section.id, 'totalQuestionsAvailable', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Marks per Question</label>
                  <input
                    type="number"
                    min="1"
                    value={section.marksPerQuestion}
                    onChange={(e) => handleUpdateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <div className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                    Choice: {section.totalQuestionsToAttempt < section.totalQuestionsAvailable 
                      ? `${section.totalQuestionsToAttempt} of ${section.totalQuestionsAvailable} ("${section.totalQuestionsAvailable - section.totalQuestionsToAttempt} Choices")`
                      : 'Compulsory (No Choice)'}
                  </div>
                </div>
              </div>

              {/* Questions List in Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wider text-slate-700">
                    Questions in Section ({questionCount} / {section.totalQuestionsAvailable} Slots Filled)
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenQuestionBank(section.id)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    + Insert from Question Bank
                  </button>
                </div>

                {section.questions.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-400">
                    <p className="text-xs">No questions in this section yet.</p>
                    <button
                      type="button"
                      onClick={() => onOpenQuestionBank(section.id)}
                      className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
                    >
                      Pick questions from Question Bank
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    {section.questions.map((q, qIndex) => (
                      <div
                        key={q.id}
                        className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="font-mono font-bold text-slate-500 shrink-0 mt-0.5">
                            Q{qIndex + 1}.
                          </span>
                          <div className="space-y-1 flex-1">
                            <div className="text-slate-900 leading-relaxed">
                              <MathRenderer content={q.text} />
                            </div>

                            {/* Internal Choice OR alternative */}
                            {q.hasInternalChoice && q.alternativeQuestionText && (
                              <div className="pt-1.5 pl-3 border-l-2 border-amber-300 text-slate-700">
                                <span className="font-bold text-amber-700 uppercase text-[10px] tracking-wider block">
                                  OR [Alternative Option]:
                                </span>
                                <MathRenderer content={q.alternativeQuestionText} />
                              </div>
                            )}

                            {/* MCQ Options preview */}
                            {q.type === 'mcq' && q.mcqOptions && (
                              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                                {q.mcqOptions.map(opt => (
                                  <div key={opt.id} className="flex items-center gap-1">
                                    <span className="font-semibold text-slate-700">({opt.label})</span>
                                    <MathRenderer content={opt.text} />
                                    {opt.isCorrect && (
                                      <span className="text-[10px] text-emerald-600 font-bold ml-1">✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Question Metadata Tags */}
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${BLOOM_COLORS[q.bloomTaxonomy]}`}>
                                {q.bloomTaxonomy}
                              </span>
                              <span>·</span>
                              <span>{q.difficulty}</span>
                              <span>·</span>
                              <span>{q.moduleUnit}</span>
                              {q.courseOutcome && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono text-indigo-600 font-semibold">{q.courseOutcome}</span>
                                </>
                              )}
                              <span>·</span>
                              <span className="font-semibold text-slate-700">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                            </div>
                          </div>
                        </div>

                        {/* Question Action Controls */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            disabled={qIndex === 0}
                            onClick={() => handleMoveQuestion(section.id, qIndex, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={qIndex === section.questions.length - 1}
                            onClick={() => handleMoveQuestion(section.id, qIndex, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionFromSection(section.id, q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 ml-1"
                            title="Remove from section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
