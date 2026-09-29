import React, { useState } from 'react';
import { PaperDocument, Question, EducationalTier } from '../types/paper';
import { HeaderConfigurator } from './HeaderConfigurator';
import { BlueprintBuilder } from './BlueprintBuilder';
import { PaperPreviewSheet } from './PaperPreviewSheet';
import { 
  Building2, 
  Layers, 
  BookOpen, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface MobileWizardProps {
  document: PaperDocument;
  onUpdateHeader: (header: PaperDocument['header']) => void;
  onApplyPreset: (tier: EducationalTier) => void;
  onSectionsChange: (sections: PaperDocument['sections']) => void;
  onOpenQuestionBank: (targetSectionId: string) => void;
  onOpenAutoGenerator: () => void;
  onUpdateDocument: (updated: Partial<PaperDocument>) => void;
  onPrint: () => void;
}

export const MobileWizard: React.FC<MobileWizardProps> = ({
  document,
  onUpdateHeader,
  onApplyPreset,
  onSectionsChange,
  onOpenQuestionBank,
  onOpenAutoGenerator,
  onUpdateDocument,
  onPrint,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { title: 'Header Setup', icon: Building2, desc: 'Institution & exam metadata' },
    { title: 'Blueprint', icon: Layers, desc: 'Rules & mark reconciliation' },
    { title: 'Questions', icon: BookOpen, desc: 'Pick & auto-compose' },
    { title: 'PDF Preview', icon: Printer, desc: 'Live A4 preview & print' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Step Indicator Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-14 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-indigo-600">Step {currentStep + 1} of 4:</span>
            <span className="text-xs font-semibold text-slate-800">{steps[currentStep].title}</span>
          </div>
          <span className="text-[11px] text-slate-500">{steps[currentStep].desc}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Content View */}
      <div className="p-4 flex-1">
        {currentStep === 0 && (
          <HeaderConfigurator
            header={document.header}
            onChange={onUpdateHeader}
            onApplyPreset={onApplyPreset}
          />
        )}

        {currentStep === 1 && (
          <BlueprintBuilder
            sections={document.sections}
            maxPaperMarks={document.header.maximumMarks}
            onSectionsChange={onSectionsChange}
            onOpenQuestionBank={onOpenQuestionBank}
            onOpenAutoGenerator={onOpenAutoGenerator}
            onEditQuestion={() => {}}
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Select & Compose Questions</h3>
              <p className="text-xs text-slate-600">
                You can either trigger 1-Click Algorithmic Blueprinting to compose all sections based on weights, or handpick questions from the offline question repository.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={onOpenAutoGenerator}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  ✨ 1-Click Algorithmic Generator
                </button>
                <button
                  type="button"
                  onClick={() => onOpenQuestionBank(document.sections[0]?.id || '')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Browse Question Bank & Insert
                </button>
              </div>
            </div>

            {/* Quick summary of currently inserted questions */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-800">Current Paper Status:</div>
              {document.sections.map(s => (
                <div key={s.id} className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 truncate max-w-[200px]">{s.title}</span>
                  <span className="font-mono font-medium text-slate-800">
                    {s.questions.length}/{s.totalQuestionsAvailable} questions ({s.totalQuestionsToAttempt * s.marksPerQuestion}M)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <PaperPreviewSheet
            document={document}
            onUpdateDocument={onUpdateDocument}
          />
        )}
      </div>

      {/* Floating Bottom Step Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between z-40">
        <button
          type="button"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-indigo-600 w-4' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print PDF
          </button>
        )}
      </div>
    </div>
  );
};
