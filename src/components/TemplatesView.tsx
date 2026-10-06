import React, { useState } from 'react';
import {
  Cpu,
  Sun,
  Zap,
  Gauge,
  Layers,
  Activity,
  Cog,
  Sliders,
  Wrench,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ENGINEERING_TEMPLATES } from '../data/templates';
import { AnalysisTemplate } from '../types/analysis';

interface TemplatesViewProps {
  onUseTemplate: (template: AnalysisTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<AnalysisTemplate>(
    ENGINEERING_TEMPLATES[0]
  );

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return Sun;
      case 'Zap':
        return Zap;
      case 'Gauge':
        return Gauge;
      case 'Layers':
        return Layers;
      case 'Activity':
        return Activity;
      case 'Cog':
        return Cog;
      case 'Sliders':
        return Sliders;
      case 'Wrench':
        return Wrench;
      default:
        return Cpu;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Engineering Specification Templates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select an engineering discipline template to load pre-configured requirement checklists, prompts, and critical technical parameters.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template List */}
        <div className="lg:col-span-5 space-y-2">
          {ENGINEERING_TEMPLATES.map((tmpl) => {
            const Icon = getTemplateIcon(tmpl.iconName);
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {tmpl.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Template Preview & Detail */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 sticky top-24">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Template Details
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedTemplate.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => onUseTemplate(selectedTemplate)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all shrink-0"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sample Client Brief */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Sample Client Brief / Message
              </h3>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                "{selectedTemplate.sampleMessage}"
              </div>
            </div>

            {/* Key Technical Questions to Check */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Critical Engineering Questions to Validate
              </h3>
              <ul className="space-y-2 text-xs">
                {selectedTemplate.keyQuestionsToCheck.map((q, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/40 border border-blue-100 text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pre-populated Parameters Preview */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Pre-configured Parameters in Form
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(selectedTemplate.defaultFormData)
                  .slice(0, 6)
                  .map(([k, v]) => (
                    <div key={k} className="p-2 rounded-md bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-500 uppercase block text-[10px]">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-slate-800 font-medium truncate block mt-0.5">
                        {String(v)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-2">
              <button
                onClick={() => onUseTemplate(selectedTemplate)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Load Template Into New Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
