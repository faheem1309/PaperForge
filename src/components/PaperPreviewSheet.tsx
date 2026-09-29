import React, { useRef } from 'react';
import { PaperDocument, Question } from '../types/paper';
import { MathRenderer } from '../utils/latexHelper';
import { 
  Printer, 
  Download, 
  Eye, 
  FileCheck, 
  ZoomIn, 
  ZoomOut, 
  ShieldAlert, 
  Sparkles,
  Sliders,
  Type
} from 'lucide-react';

interface PaperPreviewSheetProps {
  document: PaperDocument;
  onUpdateDocument: (updated: Partial<PaperDocument>) => void;
}

export const PaperPreviewSheet: React.FC<PaperPreviewSheetProps> = ({
  document,
  onUpdateDocument,
}) => {
  const { header, sections, pageFormat, fontFamily, fontSize, watermarkText, watermarkOpacity, showPageNumbers, isAnswerKeyMode } = document;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Format time allowed to hours and minutes
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) return `${hours} Hours ${remainingMins} Mins`;
    if (hours > 0) return `${hours} Hour${hours > 1 ? 's' : ''}`;
    return `${mins} Minutes`;
  };

  // Font family CSS mapping
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'Crimson Pro':
      case 'Times New Roman':
        return 'font-serif-paper';
      case 'Arial':
      case 'Noto Sans':
      default:
        return 'font-sans-ui';
    }
  };

  // Font size multiplier
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'compact':
        return 'text-[11px] leading-relaxed';
      case 'large':
        return 'text-[14px] leading-relaxed';
      case 'normal':
      default:
        return 'text-[12.5px] leading-relaxed';
    }
  };

  // Render Institution Logo / Crest
  const renderLogo = () => {
    if (header.logoUrl === 'shield') {
      return (
        <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-50">
          <svg className="w-8 h-8 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      );
    }
    if (header.logoUrl === 'star') {
      return (
        <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-50">
          <svg className="w-8 h-8 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      );
    }
    if (header.logoUrl && header.logoUrl.startsWith('data:')) {
      return (
        <img
          src={header.logoUrl}
          alt="Institution Logo"
          className="w-14 h-14 object-contain"
        />
      );
    }
    // Default academic crest
    return (
      <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center text-slate-900 bg-white">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
    );
  };

  let globalQuestionNumber = 1;

  return (
    <div className="space-y-4">
      {/* Interactive PDF Control Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Answer Key Toggle Button */}
          <button
            type="button"
            onClick={() => onUpdateDocument({ isAnswerKeyMode: !isAnswerKeyMode })}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg border transition-colors ${
              isAnswerKeyMode
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            {isAnswerKeyMode ? '✓ Solution Manual Mode' : 'Switch to Solution Key'}
          </button>

          {/* Typography Selector */}
          <select
            value={fontFamily}
            onChange={(e) => onUpdateDocument({ fontFamily: e.target.value as any })}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="Crimson Pro">Academic Serif (Crimson)</option>
            <option value="Times New Roman">Classic Times New Roman</option>
            <option value="Arial">Clean Sans-Serif (Arial)</option>
            <option value="Noto Sans">Modern Sans (Noto)</option>
          </select>

          {/* Font Size Selector */}
          <select
            value={fontSize}
            onChange={(e) => onUpdateDocument({ fontSize: e.target.value as any })}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="compact">Compact (More items/page)</option>
            <option value="normal">Normal Body (Standard A4)</option>
            <option value="large">Large (Preschool / Primary)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Watermark Selector */}
          <select
            value={watermarkText || ''}
            onChange={(e) => onUpdateDocument({ 
              watermarkText: e.target.value,
              watermarkOpacity: e.target.value ? 0.08 : 0,
            })}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="">No Watermark</option>
            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
            <option value="SAMPLE PAPER">SAMPLE PAPER</option>
            <option value="FINAL EXAM">FINAL EXAM</option>
            <option value="DRAFT">DRAFT</option>
          </select>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="flex justify-center overflow-x-auto pb-8">
        <div
          ref={printRef}
          className={`print-page-sheet relative bg-white border border-slate-300 shadow-md p-10 sm:p-12 md:p-14 text-black min-h-[1050px] w-full max-w-[820px] ${getFontFamilyClass()} ${getFontSizeClass()}`}
        >
          {/* Watermark Overlay (Vector text) */}
          {watermarkText && watermarkOpacity > 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
              style={{ opacity: watermarkOpacity }}
            >
              <span className="text-8xl sm:text-9xl font-black text-slate-900 uppercase -rotate-45 tracking-widest border-4 border-slate-900 px-8 py-4">
                {watermarkText}
              </span>
            </div>
          )}

          {/* Answer Key Banner if active */}
          {isAnswerKeyMode && (
            <div className="mb-4 py-1 px-3 bg-amber-500 text-white font-sans text-xs font-bold text-center uppercase tracking-wider rounded">
              OFFICIAL INSTRUCTOR ANSWER KEY & STEP-BY-STEP MARKING SCHEME
            </div>
          )}

          {/* Dynamic Institutional Header Block */}
          <header className="relative z-10 border-b-2 border-slate-900 pb-4 mb-4">
            {header.academicLevel === 'preschool' ? (
              /* Preschool / Primary Layout: Friendly, large titles, centered emblem */
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">{renderLogo()}</div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-900">
                  {header.institutionName}
                </h1>
                <p className="text-xs italic text-slate-700">{header.tagline}</p>
                <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-md font-bold text-xs">
                  {header.examTitle}
                </div>
                <div className="flex justify-between items-center text-xs font-semibold pt-2 border-t border-slate-200">
                  <span>Student Name: _______________________</span>
                  <span>Date: ____________</span>
                  <span>Max Marks: {header.maximumMarks}</span>
                </div>
              </div>
            ) : header.academicLevel === 'secondary' ? (
              /* High School Secondary Layout: Classic 2-column header */
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="shrink-0">{renderLogo()}</div>
                  <div className="text-center flex-1 space-y-1">
                    <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
                      {header.institutionName}
                    </h1>
                    <p className="text-xs text-slate-700">{header.tagline}</p>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {header.examTitle}
                    </h2>
                  </div>
                  {header.showRegisterNumberBox && (
                    <div className="border border-slate-800 text-[10px] p-1.5 shrink-0 text-center font-sans">
                      <div className="font-bold">Roll Number:</div>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-4 h-5 border border-slate-400" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Line */}
                <div className="mt-3 pt-2 border-t border-slate-400 grid grid-cols-3 text-xs font-semibold">
                  <div>Subject: {header.subjectTitle} ({header.subjectCode})</div>
                  <div className="text-center">Class: {header.gradeSemester}</div>
                  <div className="text-right">Max Marks: {header.maximumMarks} | Time: {formatDuration(header.timeAllowedMinutes)}</div>
                </div>
              </div>
            ) : (
              /* University / Autonomous Degree Layout (CBCS, Course Outcome codes) */
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="shrink-0 pt-1">{renderLogo()}</div>
                  <div className="text-center flex-1 space-y-0.5">
                    <h1 className="text-base sm:text-lg font-bold uppercase tracking-normal text-slate-900">
                      {header.institutionName}
                    </h1>
                    <p className="text-[11px] text-slate-700">{header.tagline}</p>
                    <div className="text-xs font-semibold text-slate-800 pt-1">
                      {header.examTitle}
                    </div>
                    <div className="text-xs font-medium text-slate-800">
                      {header.gradeSemester}
                    </div>
                  </div>

                  {header.showRegisterNumberBox && (
                    <div className="border border-slate-900 p-1.5 shrink-0 text-center font-sans">
                      <div className="text-[9px] font-bold uppercase tracking-wider">Register Number</div>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="w-3.5 h-4 border border-slate-800" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* University Course & Exam Details Grid */}
                <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                  <div>
                    <span className="font-normal text-slate-600 block text-[10px]">COURSE CODE & TITLE:</span>
                    {header.subjectCode} — {header.subjectTitle}
                  </div>
                  <div>
                    <span className="font-normal text-slate-600 block text-[10px]">AFFILIATION / CODE:</span>
                    {header.affiliationCode || 'UNIVERSITY-REG'}
                  </div>
                  <div>
                    <span className="font-normal text-slate-600 block text-[10px]">TIME ALLOWED:</span>
                    {formatDuration(header.timeAllowedMinutes)}
                  </div>
                  <div className="text-right">
                    <span className="font-normal text-slate-600 block text-[10px]">MAXIMUM MARKS:</span>
                    {header.maximumMarks} Marks
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* General Instructions Block */}
          {header.generalInstructions.length > 0 && (
            <div className="relative z-10 mb-5 p-2.5 bg-slate-50/70 border border-slate-300 rounded text-xs text-slate-800 break-inside-avoid">
              <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-900 mb-1">
                General Candidate Instructions:
              </span>
              <ol className="list-decimal list-inside space-y-0.5 text-[11.5px]">
                {header.generalInstructions.map((inst, idx) => (
                  <li key={idx} className="leading-snug">
                    <MathRenderer content={inst} />
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Exam Sections */}
          <div className="relative z-10 space-y-6">
            {sections.map((section, sIndex) => {
              return (
                <div key={section.id} className="space-y-3">
                  {/* Section Title & Instructions */}
                  <div className="text-center border-y border-slate-800 py-1.5 my-3 break-inside-avoid">
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                      {section.title}
                    </h3>
                    <p className="text-[11px] italic text-slate-700">
                      ({section.instructions}) [Total: {section.totalQuestionsToAttempt * section.marksPerQuestion} Marks]
                    </p>
                  </div>

                  {/* Questions in Section */}
                  <div className="space-y-4">
                    {section.questions.map((q, qIndex) => {
                      const currentQNum = globalQuestionNumber++;

                      return (
                        <div key={q.id} className="break-inside-avoid space-y-2">
                          {/* Question Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1">
                              <span className="font-bold font-mono shrink-0">
                                {currentQNum}.
                              </span>
                              <div className="flex-1 space-y-1.5">
                                {/* Case Study Passage if applicable */}
                                {q.type === 'case_study' && q.passageText && (
                                  <div className="p-3 border border-slate-300 bg-slate-50/60 rounded text-[11.5px] italic mb-2">
                                    <span className="font-bold font-sans not-italic uppercase text-[10px] block mb-1">
                                      Case Narrative:
                                    </span>
                                    <MathRenderer content={q.passageText} />
                                  </div>
                                )}

                                {/* Main Question Text */}
                                <div className="leading-normal">
                                  <MathRenderer content={q.text} />
                                </div>

                                {/* MCQ 4 Options Grid */}
                                {q.type === 'mcq' && q.mcqOptions && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-2 text-xs">
                                    {q.mcqOptions.map(opt => (
                                      <div
                                        key={opt.id}
                                        className={`flex items-center gap-1.5 p-1 rounded ${
                                          isAnswerKeyMode && opt.isCorrect
                                            ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300'
                                            : ''
                                        }`}
                                      >
                                        <span className="font-bold">({opt.label})</span>
                                        <MathRenderer content={opt.text} />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Match the Following Table */}
                                {q.type === 'match' && q.matchPairs && (
                                  <div className="my-2 border border-slate-400 rounded overflow-hidden max-w-lg">
                                    <table className="w-full text-xs text-left">
                                      <thead className="bg-slate-100 border-b border-slate-400 font-bold">
                                        <tr>
                                          <th className="p-1.5 border-r border-slate-400 w-1/2">Column A</th>
                                          <th className="p-1.5 w-1/2">Column B</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-300">
                                        {q.matchPairs.map(pair => (
                                          <tr key={pair.id}>
                                            <td className="p-1.5 border-r border-slate-300">
                                              <MathRenderer content={pair.leftItem} />
                                            </td>
                                            <td className="p-1.5">
                                              <MathRenderer content={pair.rightItem} />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {/* Internal Choice "OR" Prompt */}
                                {q.hasInternalChoice && q.alternativeQuestionText && (
                                  <div className="pt-2 pl-3 border-l-2 border-slate-400 space-y-1 my-1.5">
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-800 block">
                                      [OR]
                                    </span>
                                    <MathRenderer content={q.alternativeQuestionText} />
                                  </div>
                                )}

                                {/* Answer Key Solution & Rubrics (Visible in Solution Mode) */}
                                {isAnswerKeyMode && q.answerKeySolution && (
                                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 space-y-1">
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      Marking Rubric & Solution:
                                    </span>
                                    <div className="leading-relaxed">
                                      <MathRenderer content={q.answerKeySolution} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Marks & Outcomes on Right Edge */}
                            <div className="flex flex-col items-end shrink-0 pl-2 text-right">
                              <span className="font-bold text-xs font-sans">
                                [{q.marks}M]
                              </span>
                              {header.showCourseOutcomeColumn && q.courseOutcome && (
                                <span className="text-[10px] text-slate-600 font-mono mt-0.5">
                                  [{q.courseOutcome}]
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 italic">
                                {q.bloomTaxonomy}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Footer & Page Numbering */}
          <footer className="relative z-10 pt-8 mt-12 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
            <span>{header.institutionName} • {header.subjectCode}</span>
            <span className="font-bold uppercase text-[10px] tracking-widest text-slate-800">
              ★★★ END OF QUESTION PAPER ★★★
            </span>
            {showPageNumbers && <span>Page 1 of 1</span>}
          </footer>
        </div>
      </div>
    </div>
  );
};
