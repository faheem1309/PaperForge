import React, { useEffect, useState } from 'react';
import { Question, Section, QuestionType, BloomLevel, DifficultyLevel } from '../types/paper';
import { MathRenderer, COMMON_MATH_SYMBOLS } from '../utils/latexHelper';
import { 
  X, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Check, 
  BookOpen, 
  HelpCircle,
  CheckCircle2,
  Edit2
} from 'lucide-react';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionBank: Question[];
  sections: Section[];
  targetSectionId: string | null;
  onSaveQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onInsertIntoSection: (sectionId: string, question: Question) => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  questionBank,
  sections,
  targetSectionId,
  onSaveQuestion,
  onDeleteQuestion,
  onInsertIntoSection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedBloom, setSelectedBloom] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeSectionChoice, setActiveSectionChoice] = useState<string>(
    targetSectionId || sections[0]?.id || ''
  );

  useEffect(() => {
    if (isOpen) {
      setActiveSectionChoice(targetSectionId || sections[0]?.id || '');
    }
  }, [isOpen, targetSectionId, sections]);

  // Form state for creating/editing a question
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState<QuestionType>('short');
  const [formMarks, setFormMarks] = useState<number>(5);
  const [formBloom, setFormBloom] = useState<BloomLevel>('Understand');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('Medium');
  const [formSubject, setFormSubject] = useState<string>('PHYS-101');
  const [formModule, setFormModule] = useState<string>('Unit 1: Fundamentals');
  const [formOutcome, setFormOutcome] = useState<string>('CO1');
  const [formHasChoice, setFormHasChoice] = useState(false);
  const [formChoiceText, setFormChoiceText] = useState('');
  const [formAnswerKey, setFormAnswerKey] = useState('');
  const [formPassage, setFormPassage] = useState('');

  // MCQ options state
  const [mcqOptions, setMcqOptions] = useState([
    { id: '1', label: 'A', text: '', isCorrect: true },
    { id: '2', label: 'B', text: '', isCorrect: false },
    { id: '3', label: 'C', text: '', isCorrect: false },
    { id: '4', label: 'D', text: '', isCorrect: false },
  ]);

  if (!isOpen) return null;

  // Insert math symbol into formText
  const insertMathSymbol = (latex: string) => {
    setFormText(prev => prev + latex);
  };

  const resetForm = () => {
    setFormText('');
    setFormType('short');
    setFormMarks(5);
    setFormBloom('Understand');
    setFormDifficulty('Medium');
    setFormSubject('PHYS-101');
    setFormModule('Unit 1: Fundamentals');
    setFormOutcome('CO1');
    setFormHasChoice(false);
    setFormChoiceText('');
    setFormAnswerKey('');
    setFormPassage('');
    setMcqOptions([
      { id: '1', label: 'A', text: '', isCorrect: true },
      { id: '2', label: 'B', text: '', isCorrect: false },
      { id: '3', label: 'C', text: '', isCorrect: false },
      { id: '4', label: 'D', text: '', isCorrect: false },
    ]);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!formText.trim()) return;

    const newQuestion: Question = {
      id: `q-custom-${Date.now()}`,
      text: formText,
      type: formType,
      marks: formMarks,
      bloomTaxonomy: formBloom,
      difficulty: formDifficulty,
      subjectCode: formSubject,
      moduleUnit: formModule,
      courseOutcome: formOutcome,
      hasInternalChoice: formHasChoice,
      alternativeQuestionText: formHasChoice ? formChoiceText : undefined,
      answerKeySolution: formAnswerKey,
      passageText: formType === 'case_study' ? formPassage : undefined,
      mcqOptions: formType === 'mcq' ? mcqOptions : undefined,
    };

    onSaveQuestion(newQuestion);
    resetForm();
  };

  // Filter bank questions
  const filteredQuestions = questionBank.filter(q => {
    if (selectedSubject !== 'all' && q.subjectCode !== selectedSubject) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedBloom !== 'all' && q.bloomTaxonomy !== selectedBloom) return false;
    if (selectedType !== 'all' && q.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const textMatch = q.text.toLowerCase().includes(qLower);
      const moduleMatch = q.moduleUnit.toLowerCase().includes(qLower);
      const subMatch = q.subjectCode.toLowerCase().includes(qLower);
      if (!textMatch && !moduleMatch && !subMatch) return false;
    }
    return true;
  });

  const uniqueSubjects = Array.from(new Set(questionBank.map(q => q.subjectCode)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Universal Question Repository</h2>
              <p className="text-xs text-slate-500">Offline-first bank with Bloom's taxonomy & TeX math formula support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Section Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-900">Insert Target Section:</span>
              <select
                value={activeSectionChoice}
                onChange={(e) => setActiveSectionChoice(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {sections.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title} ({sec.questions.length}/{sec.totalQuestionsAvailable} questions)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              {isCreatingNew ? 'Cancel New Question' : 'Create New Question'}
            </button>
          </div>

          {/* New Question Form with TeX Equation Bar */}
          {isCreatingNew && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Author New Question</h3>
                <span className="text-xs text-slate-500">Supports LaTeX math enclosed in $...$ or $$...$$</span>
              </div>

              {/* Floating Quick Math Symbol Bar */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Quick Math & Greek Symbol Palette
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-lg">
                  {COMMON_MATH_SYMBOLS.map((sym, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertMathSymbol(sym.latex)}
                      className="px-2 py-1 text-xs font-mono font-medium text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded transition-colors"
                      title={sym.latex}
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Text & LaTeX Formulas
                </label>
                <textarea
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. Derive the energy eigenvalues $E_n = \frac{n^2 \pi^2 \hbar^2}{2mL^2}$ for an infinite potential well."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-mono"
                />
              </div>

              {/* Real-time Math Preview */}
              {formText && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Live TeX Formula Preview
                  </div>
                  <div className="text-xs text-slate-900">
                    <MathRenderer content={formText} />
                  </div>
                </div>
              )}

              {/* Question Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Question Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as QuestionType)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="short">Short Answer</option>
                    <option value="long">Long Essay / Derivation</option>
                    <option value="case_study">Case Study / Passage</option>
                    <option value="match">Match the Following</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={formMarks}
                    onChange={(e) => setFormMarks(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Bloom's Taxonomy</label>
                  <select
                    value={formBloom}
                    onChange={(e) => setFormBloom(e.target.value as BloomLevel)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Remember">Remember</option>
                    <option value="Understand">Understand</option>
                    <option value="Apply">Apply</option>
                    <option value="Analyze">Analyze</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Create">Create</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Difficulty Level</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Subject Code</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Module / Unit</label>
                  <input
                    type="text"
                    value={formModule}
                    onChange={(e) => setFormModule(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Course Outcome</label>
                  <input
                    type="text"
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    placeholder="e.g. CO1"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formHasChoice}
                      onChange={(e) => setFormHasChoice(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-medium text-slate-700">Internal Choice ("OR")</span>
                  </label>
                </div>
              </div>

              {/* If Internal Choice enabled */}
              {formHasChoice && (
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">
                    Alternative ("OR") Question Text
                  </label>
                  <textarea
                    rows={2}
                    value={formChoiceText}
                    onChange={(e) => setFormChoiceText(e.target.value)}
                    placeholder="Alternative question text..."
                    className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white font-mono"
                  />
                </div>
              )}

              {/* If MCQ, configure 4 options */}
              {formType === 'mcq' && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700">
                    MCQ Choices & Correct Key
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mcqOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg text-xs">
                        <span className="font-bold text-slate-700 w-4">{opt.label}.</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...mcqOptions];
                            updated[idx].text = e.target.value;
                            setMcqOptions(updated);
                          }}
                          placeholder={`Option ${opt.label} text or $formula$`}
                          className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = mcqOptions.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            }));
                            setMcqOptions(updated);
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            opt.isCorrect 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {opt.isCorrect ? 'Correct' : 'Mark Key'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Key / Solution Manual */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Answer Key & Marking Scheme (For Teacher Solution Manual)
                </label>
                <textarea
                  rows={2}
                  value={formAnswerKey}
                  onChange={(e) => setFormAnswerKey(e.target.value)}
                  placeholder="e.g. 1M for formula, 2M for derivation steps, 1M for final unit."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save to Question Repository
                </button>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by text, unit, or code..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedBloom}
              onChange={(e) => setSelectedBloom(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Bloom's Levels</option>
              <option value="Remember">Remember</option>
              <option value="Understand">Understand</option>
              <option value="Apply">Apply</option>
              <option value="Analyze">Analyze</option>
              <option value="Evaluate">Evaluate</option>
              <option value="Create">Create</option>
            </select>
          </div>

          {/* Questions Repository List */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Repository Questions ({filteredQuestions.length})
            </div>

            <div className="space-y-2">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex-1 space-y-1.5">
                      <div className="text-slate-900 font-medium leading-relaxed">
                        <MathRenderer content={q.text} />
                      </div>

                      {q.type === 'mcq' && q.mcqOptions && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                          {q.mcqOptions.map(opt => (
                            <div key={opt.id} className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">({opt.label})</span>
                              <MathRenderer content={opt.text} />
                              {opt.isCorrect && (
                                <span className="text-emerald-600 font-bold ml-1">✓ Key</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span className="font-mono text-indigo-700 font-semibold">{q.subjectCode}</span>
                        <span>·</span>
                        <span>{q.moduleUnit}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">{q.bloomTaxonomy}</span>
                        <span>·</span>
                        <span>{q.difficulty}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-800">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onInsertIntoSection(activeSectionChoice, q)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Insert into Section
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Delete question from repository"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No questions match your current search filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50 text-xs">
          <span className="text-slate-500">
            Total {questionBank.length} questions preserved in offline repository
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
