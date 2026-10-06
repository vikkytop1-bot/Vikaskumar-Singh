import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Download,
  FileText,
  Mail,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Zap,
  Wrench,
  Cog,
  Check,
  Share2,
  Calendar,
  Building,
  DollarSign,
  AlertOctagon,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import {
  AnalysisRecord,
  CompletenessRating,
  ProjectStatus,
  ScopeOfWorkItem,
} from '../types/analysis';
import {
  generateMarkdownReport,
  generateBOQCSV,
  generateScopeDocument,
  downloadFile,
} from '../utils/reportExport';
import { AppSettings } from '../utils/storage';

interface AnalysisResultViewProps {
  record: AnalysisRecord;
  settings: AppSettings;
  onOpenClientQuestionsModal: () => void;
  onStartNewAnalysis: () => void;
  onUpdateStatus?: (newStatus: ProjectStatus) => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  record,
  settings,
  onOpenClientQuestionsModal,
  onStartNewAnalysis,
  onUpdateStatus,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [activeScopeFilter, setActiveScopeFilter] = useState<string>('All');
  const [showRawJson, setShowRawJson] = useState(false);

  const res = record.result;

  const handleCopyReport = async () => {
    const reportText = generateMarkdownReport(record, settings);
    await navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleDownloadReport = () => {
    const reportText = generateMarkdownReport(record, settings);
    const safeTitle = (record.projectName || 'Analysis_Report').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(reportText, `${safeTitle}_Report.md`, 'text/markdown;charset=utf-8');
  };

  const handleCopyQuestions = async () => {
    const questionsText = res.clientQuestions
      .map((q, idx) => `${idx + 1}. ${q.question}`)
      .join('\n\n');
    await navigator.clipboard.writeText(questionsText);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const handleDownloadScope = () => {
    const scopeDoc = generateScopeDocument(record);
    const safeTitle = (record.projectName || 'Scope_of_Work').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(scopeDoc, `${safeTitle}_Scope.md`, 'text/markdown;charset=utf-8');
  };

  const handleDownloadBOQ = () => {
    const csv = generateBOQCSV(record);
    const safeTitle = (record.projectName || 'Preliminary_BOQ').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(csv, `${safeTitle}_BOQ.csv`, 'text/csv;charset=utf-8');
  };

  const getCompletenessBadge = (label: CompletenessRating, pct: number) => {
    if (pct >= 95) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        bar: 'bg-emerald-600',
        text: 'Ready for detailed quotation',
      };
    }
    if (pct >= 80) {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        bar: 'bg-blue-600',
        text: 'Mostly complete',
      };
    }
    if (pct >= 60) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        bar: 'bg-amber-500',
        text: 'Partially complete',
      };
    }
    if (pct >= 40) {
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-300',
        bar: 'bg-orange-500',
        text: 'Incomplete',
      };
    }
    return {
      bg: 'bg-red-50 text-red-800 border-red-300',
      bar: 'bg-red-500',
      text: 'Very incomplete',
    };
  };

  const compBadge = getCompletenessBadge(
    res.completeness?.ratingLabel || 'Incomplete',
    res.completeness?.overallPercentage || 0
  );

  const getFeasibilityBadge = (status: string) => {
    switch (status) {
      case 'Potentially feasible':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'Needs further information':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: HelpCircle,
        };
      default:
        return {
          bg: 'bg-red-100 text-red-800 border-red-300',
          icon: AlertOctagon,
        };
    }
  };

  const feasBadge = getFeasibilityBadge(res.feasibility?.status || 'Needs further information');
  const FeasIcon = feasBadge.icon;

  // Filter scope items
  const filteredScope =
    activeScopeFilter === 'All'
      ? res.scopeOfWork || []
      : (res.scopeOfWork || []).filter((s) => s.category === activeScopeFilter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Action Top Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
              {record.id}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Analysed on {new Date(record.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {res.projectSummary?.title || record.projectName}
          </h1>
          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
            <span>
              Client: <strong className="text-slate-700">{record.clientName || 'Client'}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Category:{' '}
              <strong className="text-slate-700">{res.projectSummary?.category || record.category}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-300 shadow-2xs"
            title="Copy entire formatted markdown report"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            {copiedReport ? 'Copied Report!' : 'Copy Report'}
          </button>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-300 shadow-2xs"
            title="Download report as markdown"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Download Report
          </button>

          <button
            onClick={onOpenClientQuestionsModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs"
            title="Open clean draft email for client"
          >
            <Mail className="w-3.5 h-3.5" />
            Create Client Questions
          </button>

          <button
            onClick={onStartNewAnalysis}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Start New Analysis
          </button>
        </div>
      </div>

      {/* SECTION 12 (RECOMMENDED NEXT ACTION - Highlighted as Top Executive Banner) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-xl shadow-md border-l-4 border-blue-400">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                12. RECOMMENDED NEXT ACTION
              </span>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                {res.recommendedNextAction || 'Request missing technical specifications before quotation.'}
              </p>
            </div>
          </div>

          {onUpdateStatus && (
            <div className="hidden sm:flex flex-col items-end shrink-0">
              <label className="text-[11px] text-blue-200 mb-1 font-medium">Project Status:</label>
              <select
                value={record.status}
                onChange={(e) => onUpdateStatus(e.target.value as ProjectStatus)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden"
              >
                <option value="Under Review" className="text-slate-900">Under Review</option>
                <option value="Needs Clarification" className="text-slate-900">Needs Clarification</option>
                <option value="Quoted" className="text-slate-900">Quoted</option>
                <option value="In Progress" className="text-slate-900">In Progress</option>
                <option value="Completed" className="text-slate-900">Completed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: PROJECT SUMMARY */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            1. Project Summary
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
            {res.projectSummary?.category || record.category}
          </span>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Industry / Application</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {res.projectSummary?.industry || 'General Engineering'}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Client Objective</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {res.projectSummary?.clientObjective || 'Operational requirement fulfillment'}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Overall Requirement Summary</span>
            <p className="text-sm text-slate-700 leading-relaxed mt-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              {res.projectSummary?.overallSummary}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: REQUIREMENT COMPLETENESS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            2. Requirement Completeness
          </h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${compBadge.bg}`}>
            {res.completeness?.overallPercentage}% &bull; {compBadge.text}
          </span>
        </div>
        <div className="p-5 sm:p-6 space-y-6">
          {/* Overall Progress Gauge */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Overall Specification Completeness Score
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {res.completeness?.overallPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${compBadge.bar}`}
                style={{ width: `${res.completeness?.overallPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Very Incomplete)</span>
              <span>40% (Incomplete)</span>
              <span>60% (Partially Complete)</span>
              <span>80% (Mostly Complete)</span>
              <span>100% (Ready for Quote)</span>
            </div>
          </div>

          {/* Sub-category breakdown bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {[
              { label: 'Technical Information', val: res.completeness?.categories?.technical ?? 0 },
              { label: 'Electrical Information', val: res.completeness?.categories?.electrical ?? 0 },
              { label: 'Mechanical Information', val: res.completeness?.categories?.mechanical ?? 0 },
              { label: 'Control & Automation', val: res.completeness?.categories?.controlAutomation ?? 0 },
              { label: 'Installation & Site Conditions', val: res.completeness?.categories?.installation ?? 0 },
              { label: 'Commercial & Budget Constraints', val: res.completeness?.categories?.commercial ?? 0 },
              { label: 'Timeline & Delivery Deadlines', val: res.completeness?.categories?.timeline ?? 0 },
            ].map((cat, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{cat.label}</span>
                  <span className="font-mono">{cat.val}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      cat.val >= 80 ? 'bg-emerald-500' : cat.val >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${cat.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 9: REQUIREMENT CONFLICTS (Shown high if present!) */}
      {res.conflicts && res.conflicts.length > 0 && (
        <div className="bg-red-50/90 rounded-xl border-2 border-red-400 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-red-100/80 border-b border-red-300 flex items-center justify-between">
            <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              9. Requirement Conflicts Detected ({res.conflicts.length})
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white">
              CRITICAL ATTENTION REQUIRED
            </span>
          </div>
          <div className="p-5 space-y-4">
            {res.conflicts.map((c, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-red-200 shadow-2xs space-y-2">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[11px] font-bold rounded-sm shrink-0">
                    CONFLICT #{i + 1}
                  </span>
                  <h3 className="text-sm font-bold text-red-900">{c.conflict}</h3>
                </div>
                <p className="text-xs text-slate-700">
                  <strong className="text-red-800">Why it is a problem:</strong> {c.whyProblem}
                </p>
                <div className="p-2.5 bg-red-50 rounded-md text-xs text-red-900 font-medium">
                  <strong>Information Required to Resolve:</strong> {c.requiredResolution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CLIENT-PROVIDED REQUIREMENTS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            3. Client-Provided Requirements (Confirmed Explicit Data)
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Strictly contains only client-provided facts
          </span>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            { title: 'Electrical', items: res.confirmedRequirements?.electrical, icon: Zap },
            { title: 'Electronics', items: res.confirmedRequirements?.electronics, icon: Cpu },
            { title: 'Mechanical', items: res.confirmedRequirements?.mechanical, icon: Cog },
            { title: 'Software / Control', items: res.confirmedRequirements?.softwareControl, icon: Layers },
            { title: 'Installation & Site', items: res.confirmedRequirements?.installation, icon: Wrench },
            { title: 'Commercial & Budget', items: res.confirmedRequirements?.commercial, icon: DollarSign },
            { title: 'Timeline & Deadlines', items: res.confirmedRequirements?.timeline, icon: Calendar },
          ].map((sec, idx) => {
            const Icon = sec.icon;
            const hasItems = sec.items && sec.items.length > 0;
            return (
              <div key={idx} className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 pb-1 border-b border-slate-200">
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  {sec.title}
                </div>
                {hasItems ? (
                  <ul className="space-y-1.5 text-slate-700">
                    {sec.items?.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400 italic">No explicit data provided by client.</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: MISSING INFORMATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            4. Missing Information (Required for Quotation / Sizing)
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {res.missingInformation?.length || 0} items identified
          </span>
        </div>
        <div className="p-5 sm:p-6">
          {(!res.missingInformation || res.missingInformation.length === 0) ? (
            <div className="text-xs text-slate-500 italic">No critical missing information detected.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {res.missingInformation.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between text-xs space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800">{item.item}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          item.priority === 'HIGH'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : item.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong className="text-slate-700">Why it matters:</strong> {item.whyItMatters}
                    </p>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-400 font-mono uppercase">
                    Status: <span className="text-amber-700 font-bold">MISSING</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: CLIENT FOLLOW-UP QUESTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              5. Client Follow-Up Questions (Ready to Send)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Practical and non-technical language tailored for client understanding
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuestions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors shadow-2xs"
            >
              {copiedQuestions ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              {copiedQuestions ? 'Copied Questions!' : '[COPY QUESTIONS]'}
            </button>
            <button
              onClick={onOpenClientQuestionsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              Draft Client Email
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          {(!res.clientQuestions || res.clientQuestions.length === 0) ? (
            <div className="text-xs text-slate-500 italic">No follow-up questions needed.</div>
          ) : (
            res.clientQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{q.question}</p>
                  {q.rationale && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      <strong className="text-slate-600">Engineering rationale:</strong> {q.rationale}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 6: PRELIMINARY SCOPE OF WORK */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              6. Preliminary Scope of Work
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on confirmed requirements vs optional items needing confirmation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadScope}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              [ CREATE PROJECT SCOPE ]
            </button>
          </div>
        </div>

        {/* Scope category filter buttons */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500 mr-2 text-[11px]">Filter Category:</span>
          {[
            'All',
            'Design',
            'Engineering',
            'Procurement',
            'Fabrication',
            'Programming',
            'Installation',
            'Testing',
            'Commissioning',
            'Documentation',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveScopeFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                activeScopeFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 space-y-2.5">
          {filteredScope.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No scope items in this category.</div>
          ) : (
            filteredScope.map((scope, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-bold text-[11px] shrink-0">
                    {scope.category}
                  </span>
                  <span className="text-slate-800 font-medium leading-relaxed">
                    {scope.description}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center ${
                    scope.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {scope.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 7: PRELIMINARY BILL OF QUANTITIES (BOQ) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              7. Preliminary Bill of Materials (BOQ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Preliminary component sizing without inventing unconfirmed ratings (TBD used where appropriate)
            </p>
          </div>
          <button
            onClick={handleDownloadBOQ}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            [ CREATE PRELIMINARY BOQ ] (CSV)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Specification</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Basis</th>
                <th className="py-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(!res.preliminaryBOQ || res.preliminaryBOQ.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-slate-400 italic text-center">
                    Insufficient information to formulate preliminary BOQ.
                  </td>
                </tr>
              ) : (
                res.preliminaryBOQ.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.item}</td>
                    <td className="py-3 px-4 text-slate-700">{row.description}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-800">
                      {row.specification.includes('TBD') ? (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1 py-0.5 rounded-sm">
                          {row.specification}
                        </span>
                      ) : (
                        row.specification
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold">{row.quantity}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{row.basis}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.confidence === 'High'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.confidence === 'Medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.confidence}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 8: ENGINEERING RISKS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            8. Engineering Risks
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {res.risks?.length || 0} technical risks flagged
          </span>
        </div>
        <div className="p-5 sm:p-6 space-y-3.5">
          {(!res.risks || res.risks.length === 0) ? (
            <div className="text-xs text-slate-500 italic">No critical risks flagged.</div>
          ) : (
            res.risks.map((risk, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/80 text-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{risk.risk}</div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      risk.level === 'HIGH'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : risk.level === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {risk.level} RISK
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  <strong className="text-slate-800">Why it matters:</strong> {risk.whyItMatters}
                </p>
                <div className="p-2.5 bg-white rounded-md border border-slate-200 text-slate-800">
                  <strong className="text-blue-700">Recommended Engineering Mitigation:</strong> {risk.mitigation}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 10: ASSUMPTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            10. Engineering Assumptions
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Explicitly labelled — not converted to confirmed specs
          </span>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          {(!res.assumptions || res.assumptions.length === 0) ? (
            <div className="text-xs text-slate-500 italic">No assumptions recorded.</div>
          ) : (
            res.assumptions.map((assump, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
              >
                <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-xs text-[10px] font-mono">
                    ASSUMPTION #{idx + 1}
                  </span>
                  <span>{assump.assumption}</span>
                </div>
                <div className="text-slate-600 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div>
                    <strong className="text-slate-700">Engineering Basis:</strong> {assump.basis}
                  </div>
                  <div>
                    <strong className="text-red-700">Risk if Wrong:</strong> {assump.riskIfWrong}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 11: PRELIMINARY FEASIBILITY & ENGINEERING SAFETY */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FeasIcon className="w-4 h-4 text-blue-600" />
            11. Preliminary Feasibility & Safety Review
          </h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${feasBadge.bg}`}>
            {res.feasibility?.status || 'Needs further information'}
          </span>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 text-sm">
              Feasibility Assessment Summary:
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {res.feasibility?.summary}
            </p>
            {res.feasibility?.engineeringReviewNotes && (
              <div className="pt-2 border-t border-slate-200 text-slate-600">
                <strong>Review Notes:</strong> {res.feasibility.engineeringReviewNotes}
              </div>
            )}
          </div>

          {/* Mandatory Engineering Safety Disclaimer */}
          <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-300 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>ENGINEERING SAFETY & COMPLIANCE NOTICE</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This assessment is generated as an engineering requirement analysis tool and is strictly preliminary. It does NOT constitute a final certified engineering design, safety compliance stamp, or live work instruction. Equipment sizing, circuit protection, short-circuit withstand, and thermal dissipation must be physically verified by a qualified, licensed engineer in accordance with local safety standards (e.g. IEC, IEEE, NEC, NFPA).
            </p>
          </div>
        </div>
      </div>

      {/* Raw JSON Debug View Drawer (Collapsible) */}
      <div className="pt-2">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs text-slate-500 hover:text-slate-800 font-mono underline"
        >
          {showRawJson ? 'Hide Raw JSON Response' : 'View Structured Raw JSON'}
        </button>
        {showRawJson && (
          <pre className="mt-2 p-4 bg-slate-900 text-emerald-400 text-xs rounded-xl overflow-x-auto max-h-96">
            {JSON.stringify(res, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
