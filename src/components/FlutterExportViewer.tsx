import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Folder, Terminal } from 'lucide-react';

export const FLUTTER_CODE_FILES: Record<string, { filename: string; path: string; language: string; content: string }> = {
  'pubspec.yaml': {
    filename: 'pubspec.yaml',
    path: 'pubspec.yaml',
    language: 'yaml',
    content: `name: paper_forge_studio
description: "PaperForge Studio™ - Universal Cross-Platform Offline-First Question Paper & Assessment Engine"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.5.1
  
  # Offline Database & Local Storage
  sqflite: ^2.3.2
  sqflite_common_ffi: ^2.3.2 # Desktop support (Windows, macOS, Linux)
  path_provider: ^2.1.2
  path: ^1.9.0
  
  # Vector PDF Rendering & Native Printing
  pdf: ^3.10.8
  printing: ^5.12.0
  
  # Mathematical Notation & TeX Formatting
  flutter_math_fork: ^0.7.2
  
  # UI & Responsive Adaptive Layout
  flutter_adaptive_scaffold: ^0.1.9
  google_fonts: ^6.2.0
  uuid: ^4.3.3
  intl: ^0.19.0
  file_picker: ^8.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/fonts/
`,
  },

  'lib/models/paper_models.dart': {
    filename: 'paper_models.dart',
    path: 'lib/models/paper_models.dart',
    language: 'dart',
    content: `import 'package:uuid/uuid.dart';

enum EducationalTier { preschool, secondary, university }
enum QuestionType { mcq, short, long, match, caseStudy }
enum BloomLevel { remember, understand, apply, analyze, evaluate, create }
enum DifficultyLevel { easy, medium, hard }

class McqOption {
  final String id;
  final String label;
  final String text;
  final bool isCorrect;

  McqOption({
    required this.id,
    required this.label,
    required this.text,
    this.isCorrect = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'label': label,
    'text': text,
    'isCorrect': isCorrect ? 1 : 0,
  };

  factory McqOption.fromMap(Map<String, dynamic> map) => McqOption(
    id: map['id'],
    label: map['label'],
    text: map['text'],
    isCorrect: map['isCorrect'] == 1,
  );
}

class Question {
  final String id;
  final String text;
  final QuestionType type;
  final int marks;
  final BloomLevel bloomTaxonomy;
  final DifficultyLevel difficulty;
  final String subjectCode;
  final String moduleUnit;
  final String? courseOutcome;
  final List<McqOption>? mcqOptions;
  final bool hasInternalChoice;
  final String? alternativeQuestionText;
  final String? answerKeySolution;
  final String? passageText;

  Question({
    required this.id,
    required this.text,
    required this.type,
    required this.marks,
    required this.bloomTaxonomy,
    required this.difficulty,
    required this.subjectCode,
    required this.moduleUnit,
    this.courseOutcome,
    this.mcqOptions,
    this.hasInternalChoice = false,
    this.alternativeQuestionText,
    this.answerKeySolution,
    this.passageText,
  });
}

class Section {
  final String id;
  String title;
  String instructions;
  int totalQuestionsToAttempt;
  int totalQuestionsAvailable;
  int marksPerQuestion;
  List<Question> questions;

  Section({
    required this.id,
    required this.title,
    required this.instructions,
    required this.totalQuestionsToAttempt,
    required this.totalQuestionsAvailable,
    required this.marksPerQuestion,
    List<Question>? questions,
  }) : questions = questions ?? [];

  int get expectedMarks => totalQuestionsToAttempt * marksPerQuestion;
}

class PaperHeader {
  String institutionName;
  String tagline;
  String affiliationCode;
  String? logoPath;
  String examTitle;
  EducationalTier academicLevel;
  String subjectTitle;
  String subjectCode;
  String gradeSemester;
  int timeAllowedMinutes;
  int maximumMarks;
  bool showRegisterNumberBox;
  bool showCourseOutcomeColumn;
  List<String> generalInstructions;

  PaperHeader({
    required this.institutionName,
    required this.tagline,
    required this.affiliationCode,
    this.logoPath,
    required this.examTitle,
    this.academicLevel = EducationalTier.university,
    required this.subjectTitle,
    required this.subjectCode,
    required this.gradeSemester,
    required this.timeAllowedMinutes,
    required this.maximumMarks,
    this.showRegisterNumberBox = true,
    this.showCourseOutcomeColumn = true,
    required this.generalInstructions,
  });
}

class PaperBlueprint {
  final String id;
  final PaperHeader header;
  final List<Section> sections;
  final String watermarkText;
  final double watermarkOpacity;
  final bool isAnswerKeyMode;

  PaperBlueprint({
    required this.id,
    required this.header,
    required this.sections,
    this.watermarkText = 'CONFIDENTIAL',
    this.watermarkOpacity = 0.08,
    this.isAnswerKeyMode = false,
  });

  int get totalCalculatedMarks => sections.fold(
    0, (sum, sec) => sum + (sec.totalQuestionsToAttempt * sec.marksPerQuestion),
  );

  bool get isMarksReconciled => totalCalculatedMarks == header.maximumMarks;
}
`,
  },

  'lib/services/pdf_generator_service.dart': {
    filename: 'pdf_generator_service.dart',
    path: 'lib/services/pdf_generator_service.dart',
    language: 'dart',
    content: `import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/paper_models.dart';

class PdfGeneratorService {
  /// Compiles a pixel-perfect, print-ready A4 assessment paper in pure binary vector PDF.
  static Future<Uint8List> generatePaperPdf(PaperBlueprint blueprint) async {
    final pdf = pw.Document();

    final fontRegular = await PdfGoogleFonts.crimsonProRegular();
    final fontBold = await PdfGoogleFonts.crimsonProBold();
    final fontItalic = await PdfGoogleFonts.crimsonProItalic();
    final monoFont = await PdfGoogleFonts.jetBrainsMonoRegular();

    final theme = pw.ThemeData.withFont(
      base: fontRegular,
      bold: fontBold,
      italic: fontItalic,
    );

    int questionCounter = 1;

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 36, vertical: 36),
        theme: theme,
        header: (pw.Context context) => _buildRunningHeader(context, blueprint),
        footer: (pw.Context context) => _buildRunningFooter(context, blueprint),
        build: (pw.Context context) {
          return [
            // Dynamic Institutional Header
            _buildInstitutionalHeader(blueprint.header),
            pw.SizedBox(height: 8),

            // General Candidate Guidelines
            if (blueprint.header.generalInstructions.isNotEmpty) ...[
              _buildGeneralInstructions(blueprint.header.generalInstructions),
              pw.SizedBox(height: 12),
            ],

            // Render all sections and questions
            ...blueprint.sections.map((section) {
              return pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader(section),
                  pw.SizedBox(height: 8),
                  ...section.questions.map((question) {
                    final qNum = questionCounter++;
                    return _buildQuestionItem(qNum, question, blueprint.isAnswerKeyMode, monoFont);
                  }),
                  pw.SizedBox(height: 12),
                ],
              );
            }),

            // End of paper marker
            pw.Divider(thickness: 0.5, color: PdfColors.grey700),
            pw.Center(
              child: pw.Text(
                '★★★ END OF QUESTION PAPER ★★★',
                style: pw.TextStyle(font: fontBold, fontSize: 10, letterSpacing: 2),
              ),
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildRunningHeader(pw.Context context, PaperBlueprint blueprint) {
    if (context.pageNumber == 1) return pw.SizedBox.shrink();
    return pw.Container(
      alignment: pw.Alignment.centerRight,
      margin: const pw.EdgeInsets.only(bottom: 8),
      child: pw.Text(
        '\${blueprint.header.subjectCode} - \${blueprint.header.subjectTitle}',
        style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
      ),
    );
  }

  static pw.Widget _buildRunningFooter(pw.Context context, PaperBlueprint blueprint) {
    return pw.Container(
      alignment: pw.Alignment.center,
      margin: const pw.EdgeInsets.only(top: 12),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            blueprint.header.institutionName,
            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
          ),
          pw.Text(
            'Page \${context.pageNumber} of \${context.pagesCount}',
            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildInstitutionalHeader(PaperHeader header) {
    return pw.Container(
      padding: const pw.EdgeInsets.only(bottom: 8),
      decoration: const pw.BoxDecoration(
        border: pw.Border(bottom: pw.BorderSide(width: 1.5, color: PdfColors.black)),
      ),
      child: pw.Column(
        children: [
          pw.Text(
            header.institutionName.toUpperCase(),
            style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
            textAlign: pw.TextAlign.center,
          ),
          pw.Text(
            header.tagline,
            style: const pw.TextStyle(fontSize: 8.5, fontStyle: pw.FontStyle.italic),
            textAlign: pw.TextAlign.center,
          ),
          pw.SizedBox(height: 3),
          pw.Text(
            header.examTitle.toUpperCase(),
            style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold),
          ),
          pw.SizedBox(height: 6),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('Subject: \${header.subjectTitle} (\${header.subjectCode})', style: const pw.TextStyle(fontSize: 9)),
              pw.Text('Max Marks: \${header.maximumMarks}', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold)),
              pw.Text('Time: \${header.timeAllowedMinutes} Mins', style: const pw.TextStyle(fontSize: 9)),
            ],
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildGeneralInstructions(List<String> instructions) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(6),
      decoration: pw.BoxDecoration(
        color: PdfColors.grey100,
        border: pw.Border.all(color: PdfColors.grey400, width: 0.5),
        borderRadius: const pw.BorderRadius.all(pw.Radius.circular(2)),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text('General Instructions:', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold)),
          ...instructions.map((inst) => pw.Bullet(
            text: inst,
            style: const pw.TextStyle(fontSize: 7.5),
          )),
        ],
      ),
    );
  }

  static pw.Widget _buildSectionHeader(Section section) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.symmetric(vertical: 3),
      decoration: const pw.BoxDecoration(
        border: pw.Border(
          top: pw.BorderSide(width: 0.5, color: PdfColors.black),
          bottom: pw.BorderSide(width: 0.5, color: PdfColors.black),
        ),
      ),
      child: pw.Column(
        children: [
          pw.Text(
            section.title.toUpperCase(),
            style: pw.TextStyle(fontSize: 9.5, fontWeight: pw.FontWeight.bold),
          ),
          pw.Text(
            '(\${section.instructions}) [\${section.expectedMarks} Marks]',
            style: const pw.TextStyle(fontSize: 8, fontStyle: pw.FontStyle.italic),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildQuestionItem(int qNum, Question q, bool isAnswerKey, pw.Font monoFont) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 8),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 22,
            child: pw.Text('Q\$qNum.', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold)),
          ),
          pw.Expanded(
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(q.text, style: const pw.TextStyle(fontSize: 9)),
                if (q.type == QuestionType.mcq && q.mcqOptions != null) ...[
                  pw.SizedBox(height: 4),
                  pw.Wrap(
                    spacing: 16,
                    runSpacing: 4,
                    children: q.mcqOptions!.map((opt) {
                      return pw.Text(
                        '(\${opt.label}) \${opt.text}',
                        style: pw.TextStyle(
                          fontSize: 8.5,
                          fontWeight: (isAnswerKey && opt.isCorrect) ? pw.FontWeight.bold : pw.FontWeight.normal,
                          color: (isAnswerKey && opt.isCorrect) ? PdfColors.green800 : PdfColors.black,
                        ),
                      );
                    }).toList(),
                  ),
                ],
                if (q.hasInternalChoice && q.alternativeQuestionText != null) ...[
                  pw.Padding(
                    padding: const pw.EdgeInsets.symmetric(vertical: 4),
                    child: pw.Text('[OR]', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Text(q.alternativeQuestionText!, style: const pw.TextStyle(fontSize: 9)),
                ],
                if (isAnswerKey && q.answerKeySolution != null) ...[
                  pw.SizedBox(height: 4),
                  pw.Container(
                    padding: const pw.EdgeInsets.all(4),
                    color: PdfColors.amber50,
                    child: pw.Text(
                      'Solution / Marking: \${q.answerKeySolution!}',
                      style: const pw.TextStyle(fontSize: 7.5, color: PdfColors.brown900),
                    ),
                  ),
                ],
              ],
            ),
          ),
          pw.SizedBox(width: 8),
          pw.Text('[\${q.marks}M]', style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold)),
        ],
      ),
    );
  }
}
`,
  },

  'lib/services/database_service.dart': {
    filename: 'database_service.dart',
    path: 'lib/services/database_service.dart',
    language: 'dart',
    content: `import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import '../models/paper_models.dart';

class DatabaseService {
  static final DatabaseService instance = DatabaseService._init();
  static Database? _database;

  DatabaseService._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('paper_forge_studio.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        marks INTEGER NOT NULL,
        bloomTaxonomy TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        subjectCode TEXT NOT NULL,
        moduleUnit TEXT NOT NULL,
        courseOutcome TEXT,
        hasInternalChoice INTEGER NOT NULL,
        alternativeQuestionText TEXT,
        answerKeySolution TEXT,
        passageText TEXT
      )
    ''');
  }

  Future<int> insertQuestion(Question question) async {
    final db = await instance.database;
    return await db.insert(
      'questions',
      {
        'id': question.id,
        'text': question.text,
        'type': question.type.name,
        'marks': question.marks,
        'bloomTaxonomy': question.bloomTaxonomy.name,
        'difficulty': question.difficulty.name,
        'subjectCode': question.subjectCode,
        'moduleUnit': question.moduleUnit,
        'courseOutcome': question.courseOutcome,
        'hasInternalChoice': question.hasInternalChoice ? 1 : 0,
        'alternativeQuestionText': question.alternativeQuestionText,
        'answerKeySolution': question.answerKeySolution,
        'passageText': question.passageText,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Question>> getAllQuestions() async {
    final db = await instance.database;
    final maps = await db.query('questions');

    return maps.map((map) {
      return Question(
        id: map['id'] as String,
        text: map['text'] as String,
        type: QuestionType.values.firstWhere((e) => e.name == map['type']),
        marks: map['marks'] as int,
        bloomTaxonomy: BloomLevel.values.firstWhere((e) => e.name == map['bloomTaxonomy']),
        difficulty: DifficultyLevel.values.firstWhere((e) => e.name == map['difficulty']),
        subjectCode: map['subjectCode'] as String,
        moduleUnit: map['moduleUnit'] as String,
        courseOutcome: map['courseOutcome'] as String?,
        hasInternalChoice: (map['hasInternalChoice'] as int) == 1,
        alternativeQuestionText: map['alternativeQuestionText'] as String?,
        answerKeySolution: map['answerKeySolution'] as String?,
        passageText: map['passageText'] as String?,
      );
    }).toList();
  }
}
`,
  },

  'lib/views/adaptive_main_screen.dart': {
    filename: 'adaptive_main_screen.dart',
    path: 'lib/views/adaptive_main_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import '../models/paper_models.dart';
import 'header_form.dart';
import 'blueprint_builder.dart';
import 'pdf_preview_screen.dart';

class AdaptiveMainScreen extends StatefulWidget {
  const AdaptiveMainScreen({super.key});

  @override
  State<AdaptiveMainScreen> createState() => _AdaptiveMainScreenState();
}

class _AdaptiveMainScreenState extends State<AdaptiveMainScreen> {
  int _mobileStepIndex = 0;
  int _activeEditorTab = 0; // 0: Header, 1: Blueprint / Sections

  late PaperBlueprint _blueprint;

  @override
  void initState() {
    super.initState();
    _blueprint = PaperBlueprint(
      id: 'doc-001',
      header: PaperHeader(
        institutionName: 'METROPOLITAN INSTITUTE OF TECHNOLOGY & SCIENCE',
        tagline: '(Autonomous Institution • Accredited NAAC A++)',
        affiliationCode: 'INST-AUT-2026',
        examTitle: 'B.TECH END SEMESTER EXAMINATION 2026',
        subjectTitle: 'ENGINEERING PHYSICS & QUANTUM MECHANICS',
        subjectCode: 'PHYS-101',
        gradeSemester: 'Semester II',
        timeAllowedMinutes: 180,
        maximumMarks: 100,
        generalInstructions: [
          'Answer ALL questions from Part A.',
          'Answer any 4 questions from Part B.',
          'Scientific calculators are permitted.',
        ],
      ),
      sections: [],
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 768;

        if (isDesktop) {
          // Dual-Pane Desktop Layout
          return Scaffold(
            appBar: AppBar(
              title: const Text('PaperForge Studio™', style: TextStyle(fontWeight: FontWeight.bold)),
              elevation: 0.5,
              actions: [
                IconButton(
                  icon: const Icon(Icons.print),
                  tooltip: 'Quick Print',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PdfPreviewScreen(blueprint: _blueprint),
                      ),
                    );
                  },
                ),
              ],
            ),
            body: Row(
              children: [
                // Left Pane: Interactive Form & Blueprint Editor (45% width)
                Expanded(
                  flex: 5,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border(right: BorderSide(color: Colors.grey.shade300)),
                    ),
                    child: Column(
                      children: [
                        TabBar(
                          tabs: const [
                            Tab(icon: Icon(Icons.school), text: '1. Header Setup'),
                            Tab(icon: Icon(Icons.account_tree), text: '2. Sections & Blueprint'),
                          ],
                          onTap: (index) => setState(() => _activeEditorTab = index),
                        ),
                        Expanded(
                          child: _activeEditorTab == 0
                              ? HeaderForm(
                                  header: _blueprint.header,
                                  onChanged: (h) => setState(() => _blueprint.header = h),
                                )
                              : BlueprintBuilderView(
                                  blueprint: _blueprint,
                                  onChanged: () => setState(() {}),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Right Pane: Dynamic Live A4 PDF Preview (55% width)
                Expanded(
                  flex: 6,
                  child: PdfPreviewScreen(blueprint: _blueprint),
                ),
              ],
            ),
          );
        } else {
          // Mobile 4-Step Wizard View (< 768px)
          return Scaffold(
            appBar: AppBar(
              title: Text('PaperForge Studio (Step \${_mobileStepIndex + 1}/3)'),
            ),
            body: IndexedStack(
              index: _mobileStepIndex,
              children: [
                HeaderForm(
                  header: _blueprint.header,
                  onChanged: (h) => setState(() => _blueprint.header = h),
                ),
                BlueprintBuilderView(
                  blueprint: _blueprint,
                  onChanged: () => setState(() {}),
                ),
                PdfPreviewScreen(blueprint: _blueprint),
              ],
            ),
            bottomNavigationBar: NavigationBar(
              selectedIndex: _mobileStepIndex,
              onDestinationSelected: (idx) => setState(() => _mobileStepIndex = idx),
              destinations: const [
                NavigationDestination(icon: Icon(Icons.school), label: 'Header'),
                NavigationDestination(icon: Icon(Icons.view_agenda), label: 'Blueprint'),
                NavigationDestination(icon: Icon(Icons.picture_as_pdf), label: 'Preview'),
              ],
            ),
          );
        }
      },
    );
  }
}
`,
  },

  'lib/main.dart': {
    filename: 'main.dart',
    path: 'lib/main.dart',
    language: 'dart',
    content: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'views/adaptive_main_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Desktop SQLite FFI initialization (Windows, macOS, Linux)
  if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }

  runApp(const PaperForgeApp());
}

class PaperForgeApp extends StatelessWidget {
  const PaperForgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PaperForge Studio™',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
        ),
      ),
      home: const AdaptiveMainScreen(),
    );
  }
}
`,
  },
};

export const FlutterExportViewer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeKey, setActiveKey] = useState<string>('pubspec.yaml');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFile = FLUTTER_CODE_FILES[activeKey];

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(activeKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadAll = () => {
    // Pack all files into a single bundle
    const bundleText = Object.entries(FLUTTER_CODE_FILES)
      .map(([key, file]) => `// =================== FILE: ${file.path} ===================\n${file.content}\n\n`)
      .join('\n');

    const blob = new Blob([bundleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'paper_forge_studio_flutter_codebase.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-700">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Production-Ready Flutter Architecture
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                  Dart 3.x • Material 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">Complete modular cross-platform code for Android, iOS, Windows, macOS, Linux</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download All Files
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/60 p-3 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
              <Folder className="w-3 h-3 text-slate-400" />
              Project Files
            </div>

            {Object.keys(FLUTTER_CODE_FILES).map(key => {
              const file = FLUTTER_CODE_FILES[key];
              const isActive = activeKey === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveKey(key)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-indigo-950 text-indigo-200 font-semibold border border-indigo-700/50'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File Path & Copy Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/40 text-xs text-slate-400 font-mono">
              <span>{currentFile.path}</span>
              <button
                type="button"
                onClick={() => handleCopy(currentFile.content)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {copiedKey === activeKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-slate-200 leading-relaxed selection:bg-indigo-900 select-text">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
