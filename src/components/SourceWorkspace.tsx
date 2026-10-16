import React, { useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { FileText, UploadCloud, ClipboardPaste, Trash2, RotateCcw, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronRight, Plus, Save } from 'lucide-react';
import { SourceDocument, SourceRole, SourceStatus, SOURCE_ROLE_LABELS, SyllabusTopic } from '../types/source';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface Props { documents: SourceDocument[]; onChange: (documents: SourceDocument[]) => void; }
const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = '.pdf,.docx,.pptx,.txt,.md,.rtf,.odt,.jpg,.jpeg,.png,.tif,.tiff,.webp';
const roleOptions = Object.entries(SOURCE_ROLE_LABELS) as [SourceRole, string][];

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatBytes = (n: number) => n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
const xmlText = (xml: string) => xml.replace(/<w:tab[^>]*\/>/g, '\t').replace(/<a:br[^>]*\/>|<w:br[^>]*\/>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

async function extractFile(file: File): Promise<{ text: string; pages?: number; warnings: string[] }> {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  if (file.size > MAX_BYTES) throw new Error('File exceeds the 25 MB browser processing limit.');
  if (['txt', 'md', 'rtf'].includes(ext)) {
    const raw = await file.text();
    return { text: ext === 'rtf' ? raw.replace(/\\[a-z]+\d* ?|[{}]/gi, ' ').replace(/\s+/g, ' ').trim() : raw, warnings: ext === 'rtf' ? ['RTF formatting was flattened to text. Review headings before approving the syllabus.'] : [] };
  }
  if (ext === 'pdf') {
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocument({ data }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push((content.items as { str?: string }[]).map(item => item.str || '').join(' '));
    }
    const text = pages.join('\n\n');
    return { text, pages: pdf.numPages, warnings: text.trim() ? [] : ['No selectable text was found. This PDF appears scanned/image-only and requires OCR before it can ground generation.'] };
  }
  if (['docx', 'pptx', 'odt'].includes(ext)) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const names = Object.keys(zip.files).filter(name => /word\/document\.xml$|ppt\/slides\/slide\d+\.xml$|content\.xml$/.test(name));
    const parts = await Promise.all(names.sort().map(async name => xmlText(await zip.files[name].async('text'))));
    const text = parts.filter(Boolean).join('\n\n');
    return { text, warnings: text ? ['Office formatting, tables, and diagrams were flattened to text. Review the extracted structure.'] : ['No readable text was found in this office document.'] };
  }
  if (['jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp'].includes(ext)) return { text: '', warnings: ['Image uploaded successfully, but OCR is not available in this browser-only workspace. Connect a server OCR provider before using it for grounded generation.'] };
  throw new Error(`Unsupported file type .${ext}`);
}

function inferTopics(text: string, documentId: string): SyllabusTopic[] {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const candidates = lines.filter(line => /^(unit|module|chapter|part|topic|[0-9]+[.)]|[IVX]+[.)])/i.test(line) && line.length < 160);
  return Array.from(new Set(candidates)).slice(0, 80).map(title => ({ id: uid('topic'), title: title.replace(/^[•*-]\s*/, ''), sourceDocumentId: documentId, children: [], approved: false, inferred: true }));
}

export const SourceWorkspace: React.FC<Props> = ({ documents, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteName, setPasteName] = useState('Pasted syllabus notes');
  const [pasteText, setPasteText] = useState('');
  const [expanded, setExpanded] = useState<string | null>(documents[0]?.id || null);
  const [busy, setBusy] = useState(false);

  const official = documents.filter(doc => doc.role === 'official_syllabus');
  const readyCount = documents.filter(doc => doc.status === 'ready' || doc.status === 'needs_review').length;
  const allTopics = useMemo(() => official.flatMap(doc => doc.syllabusTopics), [official]);

  const update = (id: string, patch: Partial<SourceDocument>) => onChange(documents.map(doc => doc.id === id ? { ...doc, ...patch } : doc));
  const process = async (file: File, role: SourceRole = 'supporting_material') => {
    const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
    if (documents.some(doc => doc.fingerprint === fingerprint)) return;
    const id = uid('source');
    const base: SourceDocument = { id, name: file.name, format: file.name.split('.').pop()?.toUpperCase() || 'FILE', sizeBytes: file.size, role, status: 'processing', extractedText: '', warnings: [], addedAt: new Date().toISOString(), fingerprint, syllabusTopics: [] };
    onChange([base, ...documents]); setExpanded(id);
    try {
      const result = await extractFile(file);
      const status: SourceStatus = result.warnings.length ? 'needs_review' : 'ready';
      update(id, { status, extractedText: result.text, pageCount: result.pages, warnings: result.warnings, syllabusTopics: role === 'official_syllabus' ? inferTopics(result.text, id) : [] });
    } catch (error) { update(id, { status: 'failed', warnings: [error instanceof Error ? error.message : 'Could not process this file.'] }); }
  };
  const addPaste = () => {
    if (!pasteText.trim()) return;
    const id = uid('source');
    const doc: SourceDocument = { id, name: pasteName.trim() || 'Pasted syllabus notes', format: 'TEXT', sizeBytes: new Blob([pasteText]).size, role: 'official_syllabus', status: 'needs_review', extractedText: pasteText, warnings: ['Pasted content is user-provided. Review inferred topics before approving.'], addedAt: new Date().toISOString(), fingerprint: `paste:${pasteText.length}:${pasteText.slice(0, 40)}`, syllabusTopics: inferTopics(pasteText, id) };
    onChange([doc, ...documents]); setExpanded(id); setPasteText(''); setPasteOpen(false);
  };
  const retry = async (doc: SourceDocument) => { const blob = new Blob([doc.extractedText || '']); const file = new File([blob], doc.name, { type: 'text/plain' }); await process(file, doc.role); };
  const updateTopic = (docId: string, topicId: string, title: string) => onChange(documents.map(doc => doc.id === docId ? { ...doc, syllabusTopics: doc.syllabusTopics.map(topic => topic.id === topicId ? { ...topic, title, inferred: false } : topic) } : doc));

  return <div className="space-y-6">
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-indigo-900"><UploadCloud className="h-5 w-5" /><h2 className="text-base font-bold">Source workspace</h2></div><p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">Upload an official syllabus first, then add lecture notes, textbooks, previous papers, or marking schemes. Files stay in this browser workspace until a server storage connector is configured.</p></div><div className="flex gap-2"><button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Add files</button><button type="button" onClick={() => setPasteOpen(!pasteOpen)} className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><ClipboardPaste className="h-3.5 w-3.5" /> Paste text</button></div></div>
      <input ref={inputRef} hidden type="file" multiple accept={ACCEPT} onChange={e => { const files = Array.from(e.target.files || []); setBusy(true); Promise.all(files.map(file => process(file, official.length ? 'supporting_material' : 'official_syllabus'))).finally(() => { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }); }} />
      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4"><div className="rounded-lg border border-white bg-white/80 p-2"><b>{documents.length}</b><span className="ml-1 text-slate-500">files</span></div><div className="rounded-lg border border-white bg-white/80 p-2"><b>{readyCount}</b><span className="ml-1 text-slate-500">processed</span></div><div className="rounded-lg border border-white bg-white/80 p-2"><b>{allTopics.length}</b><span className="ml-1 text-slate-500">inferred topics</span></div><div className="rounded-lg border border-white bg-white/80 p-2"><b>25 MB</b><span className="ml-1 text-slate-500">per file</span></div></div>
      {busy && <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing files locally…</div>}
    </div>
    {pasteOpen && <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-[1fr_auto] "><input value={pasteName} onChange={e => setPasteName(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Source name" /><button type="button" onClick={addPaste} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><Save className="h-3.5 w-3.5" /> Save pasted source</button></div><textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={7} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" placeholder="Paste syllabus, module list, learning outcomes, or supporting notes here…" /></div>}
    <div className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-bold text-slate-900">Uploaded sources</h3><p className="text-xs text-slate-500">Assign the source role explicitly; only approved official-syllabus topics should control generation scope.</p></div>{documents.length === 0 ? <div className="p-8 text-center text-xs text-slate-500">No sources yet. Add a syllabus or paste one to start building your subject workspace.</div> : <div className="divide-y divide-slate-100">{documents.map(doc => <div key={doc.id} className="p-4"><div className="flex items-start gap-3"><button type="button" onClick={() => setExpanded(expanded === doc.id ? null : doc.id)} className="mt-0.5 text-slate-500">{expanded === doc.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button><FileText className="mt-0.5 h-4 w-4 text-indigo-600" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold text-slate-900">{doc.name}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">{doc.format} · {formatBytes(doc.sizeBytes)}</span>{doc.status === 'ready' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : doc.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}</div><div className="mt-2 flex flex-wrap items-center gap-2"><select value={doc.role} onChange={e => update(doc.id, { role: e.target.value as SourceRole })} className="rounded-md border border-slate-300 px-2 py-1 text-[11px]">{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="text-[11px] text-slate-500">{doc.pageCount ? `${doc.pageCount} pages · ` : ''}{doc.extractedText.length.toLocaleString()} extracted characters · {doc.status.replace('_', ' ')}</span></div></div><button type="button" onClick={() => onChange(documents.filter(item => item.id !== doc.id))} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Remove source"><Trash2 className="h-4 w-4" /></button></div>{expanded === doc.id && <div className="ml-11 mt-4 space-y-3">{doc.warnings.map((warning, i) => <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-900"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{warning}</div>)}{doc.status === 'failed' && <button type="button" onClick={() => retry(doc)} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700"><RotateCcw className="h-3.5 w-3.5" /> Retry text processing</button>}{doc.extractedText && <details><summary className="cursor-pointer text-xs font-semibold text-slate-700">Preview extracted text</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">{doc.extractedText.slice(0, 6000)}</pre></details>}{doc.role === 'official_syllabus' && doc.syllabusTopics.length > 0 && <div><div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-bold text-slate-800">Editable syllabus outline</h4><span className="text-[10px] text-slate-500">Inferred suggestions — review before approval</span></div><div className="space-y-1">{doc.syllabusTopics.map(topic => <div key={topic.id} className="flex items-center gap-2"><input value={topic.title} onChange={e => updateTopic(doc.id, topic.id, e.target.value)} className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs" /><span className="rounded bg-amber-50 px-1.5 py-1 text-[10px] text-amber-700">review</span></div>)}</div></div>}</div>}</div>)}</div>}</div>
    <p className="text-[11px] leading-relaxed text-slate-500">Supported locally: PDF text layers, TXT, Markdown, RTF, DOCX, PPTX, and ODT text extraction. Scanned PDFs and images are accepted and flagged for OCR; they are not treated as successfully processed without OCR.</p>
  </div>;
};
