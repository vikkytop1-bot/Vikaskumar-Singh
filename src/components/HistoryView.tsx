import React, { useState } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  Copy,
  Trash2,
  Download,
  Layers,
  ArrowUpDown,
  FilePlus2,
} from 'lucide-react';
import { AnalysisRecord, EngineeringCategory, RiskLevel, ProjectStatus } from '../types/analysis';
import { generateMarkdownReport, downloadFile } from '../utils/reportExport';
import { AppSettings } from '../utils/storage';

interface HistoryViewProps {
  analyses: AnalysisRecord[];
  settings: AppSettings;
  onOpenAnalysis: (record: AnalysisRecord) => void;
  onDuplicateAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onNewAnalysisClick: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  settings,
  onOpenAnalysis,
  onDuplicateAnalysis,
  onDeleteAnalysis,
  onNewAnalysisClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'completeness' | 'name'>('date');

  const filteredAnalyses = analyses
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.projectName.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesRisk = selectedRisk === 'All' || item.riskLevel === selectedRisk;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesRisk && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'completeness') {
        return b.completenessScore - a.completenessScore;
      }
      return a.projectName.localeCompare(b.projectName);
    });

  const handleDownloadReport = (record: AnalysisRecord) => {
    const reportText = generateMarkdownReport(record, settings);
    const safeTitle = (record.projectName || 'Report').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(reportText, `${safeTitle}_Report.md`, 'text/markdown;charset=utf-8');
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analysis History & Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, duplicate, or export all previous client engineering requirement records.
          </p>
        </div>
        <button
          onClick={onNewAnalysisClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <FilePlus2 className="w-4 h-4" />
          + New Requirement Analysis
        </button>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project, client, ID or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
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

          {/* Risk */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Needs Clarification">Needs Clarification</option>
            <option value="Quoted">Quoted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="date">Sort: Latest First</option>
            <option value="completeness">Sort: Completeness</option>
            <option value="name">Sort: Project Name</option>
          </select>
        </div>
      </div>

      {/* Analyses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">No matching analyses</div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your filters or initiate a new analysis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project ID</th>
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
                {filteredAnalyses.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => onOpenAnalysis(record)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {record.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {record.projectName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {record.clientName || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {record.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              record.completenessScore >= 80
                                ? 'bg-emerald-500'
                                : record.completenessScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${record.completenessScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-xs">
                          {record.completenessScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(record.riskLevel)}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenAnalysis(record)}
                          title="Open View"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(record)}
                          title="Download Markdown Report"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateAnalysis(record.id)}
                          title="Duplicate Record"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAnalysis(record.id)}
                          title="Delete Record"
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
