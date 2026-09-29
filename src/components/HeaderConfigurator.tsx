import React from 'react';
import { PaperHeader, EducationalTier } from '../types/paper';
import { TIER_PRESETS } from '../data/defaultData';
import { GraduationCap, School, Baby, Plus, Trash2, Shield, Sparkles, Building2 } from 'lucide-react';

interface HeaderConfiguratorProps {
  header: PaperHeader;
  onChange: (updatedHeader: PaperHeader) => void;
  onApplyPreset: (tier: EducationalTier) => void;
}

export const HeaderConfigurator: React.FC<HeaderConfiguratorProps> = ({
  header,
  onChange,
  onApplyPreset,
}) => {
  const updateField = <K extends keyof PaperHeader>(field: K, value: PaperHeader[K]) => {
    onChange({
      ...header,
      [field]: value,
    });
  };

  const handleAddInstruction = () => {
    onChange({
      ...header,
      generalInstructions: [...header.generalInstructions, ''],
    });
  };

  const handleUpdateInstruction = (index: number, val: string) => {
    const updated = [...header.generalInstructions];
    updated[index] = val;
    onChange({
      ...header,
      generalInstructions: updated,
    });
  };

  const handleRemoveInstruction = (index: number) => {
    const updated = header.generalInstructions.filter((_, i) => i !== index);
    onChange({
      ...header,
      generalInstructions: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tier Preset Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Academic Tier Preset & Layout Engine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onApplyPreset('university')}
            className={`flex items-start gap-3 p-3 text-left rounded-lg border transition-all ${
              header.academicLevel === 'university'
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <GraduationCap className={`w-5 h-5 shrink-0 mt-0.5 ${header.academicLevel === 'university' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div>
              <div className="text-sm font-semibold text-slate-900">University / Autonomous</div>
              <div className="text-xs text-slate-500 mt-0.5">CBCS, Course Outcomes (COs), structured metadata & register grid</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('secondary')}
            className={`flex items-start gap-3 p-3 text-left rounded-lg border transition-all ${
              header.academicLevel === 'secondary'
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <School className={`w-5 h-5 shrink-0 mt-0.5 ${header.academicLevel === 'secondary' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div>
              <div className="text-sm font-semibold text-slate-900">Secondary (K-10 / 11-12)</div>
              <div className="text-xs text-slate-500 mt-0.5">Board exam format, 2-column header, step-marking & internal choice</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('preschool')}
            className={`flex items-start gap-3 p-3 text-left rounded-lg border transition-all ${
              header.academicLevel === 'preschool'
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <Baby className={`w-5 h-5 shrink-0 mt-0.5 ${header.academicLevel === 'preschool' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div>
              <div className="text-sm font-semibold text-slate-900">Preschool & Primary (K-5)</div>
              <div className="text-xs text-slate-500 mt-0.5">Large typography, friendly instructions, picture-matching frames</div>
            </div>
          </button>
        </div>
      </div>

      {/* Institution Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Institution & Examination Branding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Institution Name</label>
            <input
              type="text"
              value={header.institutionName}
              onChange={(e) => updateField('institutionName', e.target.value)}
              placeholder="e.g. Metropolitan Institute of Technology & Science"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subtitle / Tagline / Accreditation</label>
            <input
              type="text"
              value={header.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder="e.g. (Autonomous • Affiliated to State University • Accredited A++)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Affiliation / Center Code</label>
            <input
              type="text"
              value={header.affiliationCode}
              onChange={(e) => updateField('affiliationCode', e.target.value)}
              placeholder="e.g. INST-AUT-2026-PHY or CBSE-193048"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Examination Title</label>
            <input
              type="text"
              value={header.examTitle}
              onChange={(e) => updateField('examTitle', e.target.value)}
              placeholder="e.g. B.Tech Degree End Semester Examinations — May 2026"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>
        </div>

        {/* Institution Logo / Emblem Selection */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-medium text-slate-700 mb-2">Institution Crest / Emblem</label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => updateField('logoUrl', '')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                !header.logoUrl ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Default Academic Crest
            </button>
            <button
              type="button"
              onClick={() => updateField('logoUrl', 'shield')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                header.logoUrl === 'shield' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Classic Shield
            </button>
            <button
              type="button"
              onClick={() => updateField('logoUrl', 'star')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                header.logoUrl === 'star' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Honor Star
            </button>
            <label className="px-3 py-1.5 text-xs font-medium rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 cursor-pointer transition-colors">
              <span>Upload Custom Logo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        updateField('logoUrl', event.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Course & Timing Parameters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Course & Assessment Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject Title</label>
            <input
              type="text"
              value={header.subjectTitle}
              onChange={(e) => updateField('subjectTitle', e.target.value)}
              placeholder="e.g. Engineering Physics & Quantum Mechanics"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject / Course Code</label>
            <input
              type="text"
              value={header.subjectCode}
              onChange={(e) => updateField('subjectCode', e.target.value)}
              placeholder="e.g. PHYS-101"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Grade / Class / Semester</label>
            <input
              type="text"
              value={header.gradeSemester}
              onChange={(e) => updateField('gradeSemester', e.target.value)}
              placeholder="e.g. Semester II / Grade 10"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Time Allowed (Minutes)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="360"
                step="5"
                value={header.timeAllowedMinutes}
                onChange={(e) => updateField('timeAllowedMinutes', parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-mono tabular-nums"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">
                ({Math.floor(header.timeAllowedMinutes / 60)}h {header.timeAllowedMinutes % 60 > 0 ? `${header.timeAllowedMinutes % 60}m` : ''})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Paper Maximum Marks</label>
            <input
              type="number"
              min="1"
              max="500"
              value={header.maximumMarks}
              onChange={(e) => updateField('maximumMarks', parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Header Layout Checkboxes */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={header.showRegisterNumberBox}
              onChange={(e) => updateField('showRegisterNumberBox', e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium">Show Student Roll / Register No. Grid</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={header.showCourseOutcomeColumn}
              onChange={(e) => updateField('showCourseOutcomeColumn', e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium">Show Course Outcome (CO) Mapping Codes</span>
          </label>
        </div>
      </div>

      {/* General Instructions Builder */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">General Exam Instructions</h3>
            <p className="text-xs text-slate-500">Rendered in the candidate guidelines block below the header</p>
          </div>
          <button
            type="button"
            onClick={handleAddInstruction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
        </div>

        <div className="space-y-2">
          {header.generalInstructions.map((inst, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-5 text-right">{index + 1}.</span>
              <input
                type="text"
                value={inst}
                onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                placeholder="Enter candidate instruction or permitted tools..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
              <button
                type="button"
                onClick={() => handleRemoveInstruction(index)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title="Remove instruction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {header.generalInstructions.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">No instructions defined. Click "Add Rule" to insert instructions.</p>
          )}
        </div>
      </div>
    </div>
  );
};
