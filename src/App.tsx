import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { NewAnalysisView } from './components/NewAnalysisView';
import { AnalysisResultView } from './components/AnalysisResultView';
import { HistoryView } from './components/HistoryView';
import { TemplatesView } from './components/TemplatesView';
import { SettingsView } from './components/SettingsView';
import { ClientQuestionsModal } from './components/ClientQuestionsModal';
import {
  AnalysisRecord,
  AnalysisTemplate,
  EngineeringCategory,
  ManualRequirementFormData,
  ProjectStatus,
} from './types/analysis';
import {
  getAnalyses,
  saveAnalysis,
  deleteAnalysis,
  duplicateAnalysis,
  getSettings,
  AppSettings,
} from './utils/storage';
import { ENGINEERING_TEMPLATES } from './data/templates';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

  // Preloaded data for New Analysis (e.g. from templates)
  const [preloadData, setPreloadData] = useState<{
    category: EngineeringCategory;
    message: string;
    formData: Partial<ManualRequirementFormData>;
  }>({
    category: 'Auto Detect',
    message: '',
    formData: {},
  });

  // Client Questions Modal state
  const [modalRecord, setModalRecord] = useState<AnalysisRecord | null>(null);

  useEffect(() => {
    const loaded = getAnalyses();
    setAnalyses(loaded);
  }, []);

  const handleOpenAnalysis = (record: AnalysisRecord) => {
    setSelectedRecord(record);
  };

  const handleNewAnalysisClick = () => {
    setSelectedRecord(null);
    setPreloadData({
      category: settings.defaultCategory || 'Auto Detect',
      message: '',
      formData: {},
    });
    setActiveTab('new-analysis');
  };

  const handleAnalysisSuccess = (newRecord: AnalysisRecord) => {
    saveAnalysis(newRecord);
    setAnalyses(getAnalyses());
    setSelectedRecord(newRecord);
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateAnalysis(id);
    if (duplicated) {
      setAnalyses(getAnalyses());
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this analysis record?')) {
      const updated = deleteAnalysis(id);
      setAnalyses(updated);
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  };

  const handleUseTemplate = (template: AnalysisTemplate) => {
    setSelectedRecord(null);
    setPreloadData({
      category: template.category,
      message: template.sampleMessage,
      formData: template.defaultFormData,
    });
    setActiveTab('new-analysis');
  };

  const handleSelectTemplateById = (templateId: string) => {
    const template = ENGINEERING_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      handleUseTemplate(template);
    } else {
      setActiveTab('templates');
    }
  };

  const handleUpdateStatus = (newStatus: ProjectStatus) => {
    if (!selectedRecord) return;
    const updated = { ...selectedRecord, status: newStatus };
    saveAnalysis(updated);
    setSelectedRecord(updated);
    setAnalyses(getAnalyses());
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={selectedRecord ? ('new-analysis' as NavTab) : activeTab}
        setActiveTab={(tab) => {
          setSelectedRecord(null);
          setActiveTab(tab);
        }}
        onNewAnalysisClick={handleNewAnalysisClick}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* If a record is currently opened for review */}
        {selectedRecord ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedRecord(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {activeTab === 'history' ? 'History' : 'Dashboard'}</span>
            </button>

            <AnalysisResultView
              record={selectedRecord}
              settings={settings}
              onOpenClientQuestionsModal={() => setModalRecord(selectedRecord)}
              onStartNewAnalysis={handleNewAnalysisClick}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                analyses={analyses}
                onNewAnalysisClick={handleNewAnalysisClick}
                onOpenAnalysis={handleOpenAnalysis}
                onDuplicateAnalysis={handleDuplicate}
                onDeleteAnalysis={handleDelete}
                onSelectTemplate={handleSelectTemplateById}
              />
            )}

            {activeTab === 'new-analysis' && (
              <NewAnalysisView
                key={`${preloadData.category}-${preloadData.message.slice(0, 15)}`}
                initialCategory={preloadData.category}
                initialMessage={preloadData.message}
                initialFormData={preloadData.formData}
                onAnalysisSuccess={handleAnalysisSuccess}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                analyses={analyses}
                settings={settings}
                onOpenAnalysis={handleOpenAnalysis}
                onDuplicateAnalysis={handleDuplicate}
                onDeleteAnalysis={handleDelete}
                onNewAnalysisClick={handleNewAnalysisClick}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesView onUseTemplate={handleUseTemplate} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
              />
            )}
          </>
        )}
      </main>

      {/* Client Questions Email Draft Modal */}
      {modalRecord && (
        <ClientQuestionsModal
          record={modalRecord}
          settings={settings}
          onClose={() => setModalRecord(null)}
        />
      )}

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Engineering Client Requirement Analyser</span>
            <span>&bull;</span>
            <span>Professional Freelancer & Consulting Workflow</span>
          </div>
          <div className="text-slate-400">
            Powered by Gemini AI Engine &bull; Electrical, Electronics & Mechanical Verification
          </div>
        </div>
      </footer>
    </div>
  );
}
