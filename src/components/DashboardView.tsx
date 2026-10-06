import React from 'react';
import {
  FilePlus2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { AnalysisRecord, EngineeringCategory } from '../types/analysis';

interface DashboardViewProps {
  analyses: AnalysisRecord[];
  onNewAnalysisClick: () => void;
  onOpenAnalysis: (record: AnalysisRecord) => void;
  onDuplicateAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onSelectTemplate: (templateId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analyses,
  onNewAnalysisClick,
  onOpenAnalysis,
  onDuplicateAnalysis,
  onDeleteAnalysis,
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  // Metrics
  const totalAnalyses = analyses.length;
  const completeCount = analyses.filter((a) => a.completenessScore >= 80).length;
  const incompleteCount = analyses.filter((a) => a.completenessScore < 80).length;
  const highRiskCount = analyses.filter((a) => a.riskLevel === 'HIGH').length;

  // Filter analyses
  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch =
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            LOW RISK
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Quoted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Needs Clarification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            AI-Powered Engineering Client Requirement Analyser
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Transform Raw Client Briefs into Structured Engineering Specs
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Eliminate costly quotation mistakes, detect hidden technical risks & conflicts early, and generate professional client follow-up questions in seconds.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNewAnalysisClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-hidden"
            >
              <FilePlus2 className="w-4 h-4" />
              + New Requirement Analysis
            </button>
            <button
              onClick={() => onSelectTemplate('control-panel')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-100 font-medium text-sm rounded-lg transition-colors border border-white/15 focus:outline-hidden"
            >
              <Layers className="w-4 h-4 text-blue-300" />
              Explore Templates
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Analyses
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalAnalyses}</span>
            <span className="text-xs text-slate-500">projects logged</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Active engineering records
          </div>
        </div>

        {/* Complete Requirements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Complete Requirements
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">{completeCount}</span>
            <span className="text-xs text-emerald-600 font-medium">&ge; 80% completeness</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Ready for detailed quotation
          </div>
        </div>

        {/* Incomplete Requirements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Incomplete Requirements
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700">{incompleteCount}</span>
            <span className="text-xs text-amber-600 font-medium">&lt; 80% score</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting client follow-up answers
          </div>
        </div>

        {/* High Risk Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              High-Risk Projects
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-700">{highRiskCount}</span>
            <span className="text-xs text-red-600 font-medium">flagged</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Severe ambiguities or load conflicts
          </div>
        </div>
      </div>

      {/* Quick-Start Templates Bar */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Quick Start from Engineering Templates
          </h2>
          <button
            onClick={() => onSelectTemplate('control-panel')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all 10 templates <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'control-panel', name: 'Electrical Control Panel', cat: 'Electrical' },
            { id: 'solar-pv', name: 'Solar PV & BESS', cat: 'Renewable' },
            { id: 'motor-control', name: 'Motor VFD & Drives', cat: 'Electrical' },
            { id: 'pcb-design', name: 'PCB Hardware Design', cat: 'Embedded' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTemplate(t.id)}
              className="p-3 text-left bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all group focus:outline-hidden"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                {t.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.cat}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Analyses Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header with Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Requirement Analyses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, re-examine, or export technical requirement deliverables
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search project or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Automation / PLC">Automation / PLC</option>
              <option value="Solar / Renewable Energy">Solar / Renewable Energy</option>
              <option value="PCB / Embedded Systems">PCB / Embedded Systems</option>
              <option value="MATLAB / Simulink">MATLAB / Simulink</option>
              <option value="Mixed Engineering">Mixed Engineering</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No analyses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? 'Try adjusting your search query or category filter.'
                : 'Start your first client requirement analysis to generate structured engineering specifications.'}
            </p>
            <button
              onClick={onNewAnalysisClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              + New Requirement Analysis
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Completeness</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAnalyses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => onOpenAnalysis(item)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.projectName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.clientName || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              item.completenessScore >= 80
                                ? 'bg-emerald-500'
                                : item.completenessScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${item.completenessScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-xs text-slate-900 w-8 text-right">
                          {item.completenessScore}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {item.result?.completeness?.ratingLabel || ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getRiskBadge(item.riskLevel)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAnalysis(item)}
                          title="Open Analysis"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateAnalysis(item.id)}
                          title="Duplicate Analysis"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAnalysis(item.id)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
