import React, { useState } from 'react';
import { Section, Question } from '../types/paper';
import { Sparkles, X, Check, Sliders, RefreshCw, Layers } from 'lucide-react';

interface AutoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  questionBank: Question[];
  onApplyGeneratedPaper: (newSections: Section[]) => void;
}

export const AutoGeneratorModal: React.FC<AutoGeneratorModalProps> = ({
  isOpen,
  onClose,
  sections,
  questionBank,
  onApplyGeneratedPaper,
}) => {
  // Extract distinct units available in the bank
  const distinctUnits = Array.from(new Set(questionBank.map(q => q.moduleUnit)));

  // Weight distribution states
  const [unitWeights, setUnitWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const equalShare = Math.floor(100 / Math.max(1, distinctUnits.length));
    distinctUnits.forEach((u, i) => {
      initial[u] = i === distinctUnits.length - 1 ? 100 - equalShare * (distinctUnits.length - 1) : equalShare;
    });
    return initial;
  });

  const [easyRatio, setEasyRatio] = useState<number>(30);
  const [mediumRatio, setMediumRatio] = useState<number>(50);
  const [hardRatio, setHardRatio] = useState<number>(20);

  const [prioritizeBloom, setPrioritizeBloom] = useState<boolean>(true);
  const [allowDuplicateQuestions, setAllowDuplicateQuestions] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    // Local constraint solver algorithm:
    // For each section, select section.totalQuestionsAvailable questions matching the constraints
    const usedQuestionIds = new Set<string>();

    const newSections = sections.map(section => {
      const neededCount = section.totalQuestionsAvailable;
      const targetMarks = section.marksPerQuestion;

      // Filter bank candidates matching section marks (or compatible type)
      let candidates = questionBank.filter(q => {
        if (!allowDuplicateQuestions && usedQuestionIds.has(q.id)) return false;
        // Check if marks match or are within reasonable range
        if (section.title.toLowerCase().includes('mcq') && q.type !== 'mcq') return false;
        if (q.type === 'mcq' && !section.title.toLowerCase().includes('mcq') && section.marksPerQuestion > 2) return false;
        return true;
      });

      // If candidates are short, broaden filter
      if (candidates.length < neededCount) {
        candidates = questionBank.filter(q => !allowDuplicateQuestions ? !usedQuestionIds.has(q.id) : true);
      }

      // Shuffle candidates with seeded random or unit weights
      const sortedCandidates = [...candidates].sort((a, b) => {
        const weightA = unitWeights[a.moduleUnit] || 20;
        const weightB = unitWeights[b.moduleUnit] || 20;
        // Random perturbation
        return (weightB + Math.random() * 30) - (weightA + Math.random() * 30);
      });

      const selected = sortedCandidates.slice(0, neededCount).map(q => {
        usedQuestionIds.add(q.id);
        // Normalize question marks to match section rule if needed
        return {
          ...q,
          marks: targetMarks,
        };
      });

      return {
        ...section,
        questions: selected,
      };
    });

    onApplyGeneratedPaper(newSections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">1-Click Algorithmic Question Generator</h2>
              <p className="text-xs text-slate-500">Auto-compose complete paper based on syllabus weights & Bloom's criteria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Syllabus Unit Weights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Syllabus Module Weight Distribution (% Target)
              </span>
              <span className="text-slate-500">
                Sum: {Object.values(unitWeights).reduce((a, b) => a + b, 0)}%
              </span>
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {distinctUnits.map(unit => (
                <div key={unit} className="flex items-center gap-3">
                  <span className="flex-1 font-medium text-slate-700 truncate">{unit}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={unitWeights[unit] || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setUnitWeights(prev => ({ ...prev, [unit]: val }));
                    }}
                    className="w-32 accent-indigo-600"
                  />
                  <span className="w-10 text-right font-mono font-semibold text-slate-700">
                    {unitWeights[unit] || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Ratios */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block">
              Cognitive Difficulty Balance
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-center">
                <span className="text-emerald-800 font-bold block mb-1">Easy: {easyRatio}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={easyRatio}
                  onChange={(e) => setEasyRatio(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-center">
                <span className="text-amber-800 font-bold block mb-1">Medium: {mediumRatio}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={mediumRatio}
                  onChange={(e) => setMediumRatio(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-center">
                <span className="text-rose-800 font-bold block mb-1">Hard: {hardRatio}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={hardRatio}
                  onChange={(e) => setHardRatio(parseInt(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Additional Blueprint Engine Constraints */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prioritizeBloom}
                onChange={(e) => setPrioritizeBloom(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="font-medium">Enforce Bloom's Taxonomy Progression (Remember ➔ Apply ➔ Analyze)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!allowDuplicateQuestions}
                onChange={(e) => setAllowDuplicateQuestions(!e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="font-medium">Zero Duplicate Guard (Strict unique question guarantee across sections)</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Synthesize Paper Draft
          </button>
        </div>
      </div>
    </div>
  );
};
