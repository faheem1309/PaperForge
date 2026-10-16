import React, { useState, useEffect } from 'react';
import { PaperDocument, Question, EducationalTier, Section } from './types/paper';
import { DEFAULT_INITIAL_DOCUMENT, INITIAL_QUESTION_BANK, TIER_PRESETS } from './data/defaultData';
import { TopBar } from './components/TopBar';
import { HeaderConfigurator } from './components/HeaderConfigurator';
import { BlueprintBuilder } from './components/BlueprintBuilder';
import { PaperPreviewSheet } from './components/PaperPreviewSheet';
import { QuestionBankModal } from './components/QuestionBankModal';
import { AutoGeneratorModal } from './components/AutoGeneratorModal';
import { FlutterExportViewer } from './components/FlutterExportViewer';
import { MobileWizard } from './components/MobileWizard';
import { SourceWorkspace } from './components/SourceWorkspace';
import { SourceDocument } from './types/source';
import { 
  Building2, 
  Layers, 
  Printer, 
  Sparkles, 
  BookOpen, 
  RotateCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';

const STORAGE_KEY_DOC = 'paperforge_studio_active_doc_v1';
const STORAGE_KEY_BANK = 'paperforge_studio_question_bank_v1';
const STORAGE_KEY_SOURCES = 'paperforge_studio_sources_v1';

export default function App() {
  // Load initial document from localStorage or fallback to pre-seeded default
  const [document, setDocument] = useState<PaperDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOC);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_DOCUMENT;
  });

  // Load initial question bank from localStorage or fallback to default
  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BANK);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_QUESTION_BANK;
  });

  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOURCES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore malformed local data
    }
    return [];
  });

  // Navigation states
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'bank' | 'sources'>('editor');
  const [editorSubTab, setEditorSubTab] = useState<'header' | 'blueprint'>('header');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [targetSectionForBank, setTargetSectionForBank] = useState<string | null>(null);
  const [isAutoGeneratorOpen, setIsAutoGeneratorOpen] = useState(false);
  const [isFlutterExportOpen, setIsFlutterExportOpen] = useState(false);

  // Sync to local storage for offline persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOC, JSON.stringify(document));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [document]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(questionBank));
    } catch (e) {
      console.warn('Bank storage sync failed', e);
    }
  }, [questionBank]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(sourceDocuments));
    } catch (e) {
      console.warn('Source workspace sync failed', e);
    }
  }, [sourceDocuments]);

  // Responsive layout listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewportMode('mobile');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update handlers
  const handleUpdateHeader = (newHeader: PaperDocument['header']) => {
    setDocument(prev => ({
      ...prev,
      header: newHeader,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleApplyPreset = (tier: EducationalTier) => {
    const preset = TIER_PRESETS[tier];
    if (preset) {
      setDocument(prev => ({
        ...prev,
        ...preset,
        header: {
          ...prev.header,
          ...preset.header!,
        },
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const handleSectionsChange = (newSections: Section[]) => {
    setDocument(prev => ({
      ...prev,
      sections: newSections,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateDocument = (partial: Partial<PaperDocument>) => {
    setDocument(prev => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleOpenQuestionBank = (sectionId: string) => {
    setTargetSectionForBank(sectionId);
    setIsBankModalOpen(true);
  };

  const handleSaveQuestionToBank = (q: Question) => {
    setQuestionBank(prev => [q, ...prev]);
  };

  const handleDeleteQuestionFromBank = (qId: string) => {
    setQuestionBank(prev => prev.filter(q => q.id !== qId));
  };

  const handleInsertIntoSection = (sectionId: string, question: Question) => {
    setDocument(prev => {
      const updatedSections = prev.sections.map(sec => {
        if (sec.id === sectionId) {
          if (sec.questions.length >= sec.totalQuestionsAvailable) {
            window.alert(`This section is full. Increase the question capacity before inserting more questions.`);
            return sec;
          }
          return {
            ...sec,
            questions: [...sec.questions, { ...question, id: `q-${Date.now()}` }],
          };
        }
        return sec;
      });
      return {
        ...prev,
        sections: updatedSections,
      };
    });
  };

  const handleApplyGeneratedPaper = (generatedSections: Section[]) => {
    setDocument(prev => ({
      ...prev,
      sections: generatedSections,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset this question paper to the initial template? Any unsaved edits will be cleared.')) {
      setDocument(DEFAULT_INITIAL_DOCUMENT);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans-ui text-slate-900">
      {/* Top Bar with brand, navigation, print, flutter export */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'bank') {
            setTargetSectionForBank(document.sections[0]?.id || null);
            setIsBankModalOpen(true);
          }
        }}
        onOpenFlutterCode={() => setIsFlutterExportOpen(true)}
        onPrint={handlePrint}
        viewportMode={viewportMode}
        onToggleViewport={() => setViewportMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'sources' ? (
          <div className="h-[calc(100vh-57px)] overflow-y-auto bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto max-w-5xl">
              <SourceWorkspace documents={sourceDocuments} onChange={setSourceDocuments} />
            </div>
          </div>
        ) : viewportMode === 'mobile' ? (
          /* Mobile View: 4-Step Wizard Workflow (< 600px width or mobile toggle) */
          <MobileWizard
            document={document}
            onUpdateHeader={handleUpdateHeader}
            onApplyPreset={handleApplyPreset}
            onSectionsChange={handleSectionsChange}
            onOpenQuestionBank={handleOpenQuestionBank}
            onOpenAutoGenerator={() => setIsAutoGeneratorOpen(true)}
            onUpdateDocument={handleUpdateDocument}
            onPrint={handlePrint}
          />
        ) : (
          /* Desktop View: Dual-Pane Adaptive Layout (>= 600px) */
          activeTab === 'preview' ? (
            <div className="h-[calc(100vh-57px)] overflow-y-auto bg-slate-200/80 p-6">
              <div className="mx-auto w-full max-w-[840px]">
                <PaperPreviewSheet
                  document={document}
                  onUpdateDocument={handleUpdateDocument}
                />
              </div>
            </div>
          ) : (
          <div className="h-[calc(100vh-57px)] flex overflow-hidden">
            {/* Left Pane: Interactive Form / Blueprint Builder (45% width) */}
            <div className="w-[45%] border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
              {/* Left Pane Sub-Tabs */}
              <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEditorSubTab('header')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      editorSubTab === 'header'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    1. Header & Institution
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorSubTab('blueprint')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      editorSubTab === 'blueprint'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    2. Blueprint & Sections
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAutoGeneratorOpen(true)}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="1-Click Algorithmic Blueprinting"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Reset to Default Template"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Left Pane Scrollable Form Area */}
              <div className="flex-1 overflow-y-auto p-5">
                {editorSubTab === 'header' ? (
                  <HeaderConfigurator
                    header={document.header}
                    onChange={handleUpdateHeader}
                    onApplyPreset={handleApplyPreset}
                  />
                ) : (
                  <BlueprintBuilder
                    sections={document.sections}
                    maxPaperMarks={document.header.maximumMarks}
                    onSectionsChange={handleSectionsChange}
                    onOpenQuestionBank={handleOpenQuestionBank}
                    onOpenAutoGenerator={() => setIsAutoGeneratorOpen(true)}
                    onEditQuestion={() => {}}
                  />
                )}
              </div>
            </div>

            {/* Right Pane: Real-time dynamic A4 PDF previewer (55% width) */}
            <div className="w-[55%] bg-slate-200/80 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-full max-w-[840px]">
                <PaperPreviewSheet
                  document={document}
                  onUpdateDocument={handleUpdateDocument}
                />
              </div>
            </div>
          </div>
          )
        )}
      </main>

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        questionBank={questionBank}
        sections={document.sections}
        targetSectionId={targetSectionForBank}
        onSaveQuestion={handleSaveQuestionToBank}
        onDeleteQuestion={handleDeleteQuestionFromBank}
        onInsertIntoSection={handleInsertIntoSection}
      />

      {/* 1-Click Algorithmic Question Generator Modal */}
      <AutoGeneratorModal
        isOpen={isAutoGeneratorOpen}
        onClose={() => setIsAutoGeneratorOpen(false)}
        sections={document.sections}
        questionBank={questionBank}
        onApplyGeneratedPaper={handleApplyGeneratedPaper}
      />

      {/* Flutter Dart Code Architecture Export Viewer */}
      <FlutterExportViewer
        isOpen={isFlutterExportOpen}
        onClose={() => setIsFlutterExportOpen(false)}
      />
    </div>
  );
}
