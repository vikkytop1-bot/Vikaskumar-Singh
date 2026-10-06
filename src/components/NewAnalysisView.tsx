import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Mic,
  SlidersHorizontal,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  EngineeringCategory,
  ManualRequirementFormData,
  UploadedFileItem,
  AnalysisResult,
  AnalysisRecord,
} from '../types/analysis';

interface NewAnalysisViewProps {
  onAnalysisSuccess: (record: AnalysisRecord) => void;
  initialCategory?: EngineeringCategory;
  initialMessage?: string;
  initialFormData?: Partial<ManualRequirementFormData>;
}

export const NewAnalysisView: React.FC<NewAnalysisViewProps> = ({
  onAnalysisSuccess,
  initialCategory = 'Auto Detect',
  initialMessage = '',
  initialFormData = {},
}) => {
  // Input method tabs
  type InputTab = 'message' | 'document' | 'image' | 'audio' | 'manual';
  const [activeTab, setActiveTab] = useState<InputTab>('message');

  // Input states
  const [category, setCategory] = useState<EngineeringCategory>(initialCategory);
  const [rawText, setRawText] = useState<string>(initialMessage);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [showManualForm, setShowManualForm] = useState<boolean>(activeTab === 'manual');

  // Manual Form fields
  const [manualForm, setManualForm] = useState<ManualRequirementFormData>({
    clientName: '',
    company: '',
    email: '',
    phone: '',
    projectTitle: '',
    projectCategory: '',
    industry: '',
    projectObjective: '',
    supplyVoltage: '',
    phase: '',
    frequency: '',
    powerLoad: '',
    motorInformation: '',
    controlRequirements: '',
    plc: '',
    hmi: '',
    sensors: '',
    communication: '',
    mechanicalRequirements: '',
    dimensions: '',
    materials: '',
    environmentalConditions: '',
    installationLocation: '',
    installationRequired: '',
    testingRequired: '',
    documentationRequired: '',
    budget: '',
    quantity: '',
    deliveryDeadline: '',
    otherRequirements: '',
    ...initialFormData,
  });

  // UI status
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesList: EngineeringCategory[] = [
    'Auto Detect',
    'Electrical',
    'Electronics',
    'Mechanical',
    'Automation / PLC',
    'Solar / Renewable Energy',
    'PCB / Embedded Systems',
    'MATLAB / Simulink',
    'Mixed Engineering',
  ];

  // Load sample presets
  const loadPreset = (presetType: 'control-panel' | 'solar-conflict' | 'lora-pcb' | 'skid') => {
    setErrorMessage(null);
    if (presetType === 'control-panel') {
      setCategory('Automation / PLC');
      setRawText(
        'We need an automatic control panel for a 7.5 kW motor, two pumps and a conveyor. The system should operate automatically and have an emergency stop.'
      );
      setManualForm((prev) => ({
        ...prev,
        clientName: 'Apex Industrial Systems Ltd',
        projectTitle: 'Automated 7.5 kW Motor & Dual Pump Control Panel',
        projectCategory: 'Automation / PLC',
        industry: 'Water Treatment & Pumping',
      }));
    } else if (presetType === 'solar-conflict') {
      setCategory('Solar / Renewable Energy');
      setRawText(
        'We bought a 5 kW off-grid solar inverter and want to run our 7.5 kW (10 HP) deep borewell irrigation pump and two 1.5 kW house air conditioners. Need you to connect it and provide the wiring diagram.'
      );
      setManualForm((prev) => ({
        ...prev,
        clientName: 'Sunrise Agrofarms',
        projectTitle: 'Off-grid Solar Inverter & 7.5kW Borewell Pump Connection',
        projectCategory: 'Solar / Renewable Energy',
        industry: 'Agriculture / Irrigation',
      }));
    } else if (presetType === 'lora-pcb') {
      setCategory('PCB / Embedded Systems');
      setRawText(
        'We need a compact 4-layer PCB for a battery-operated environmental monitoring device. It uses an STM32 MCU, LoRa transceiver, I2C temperature/humidity sensor, and USB-C charging for a LiPo cell. Size must be under 50x50mm. Need schematic review and Gerber generation.'
      );
      setManualForm((prev) => ({
        ...prev,
        clientName: 'SmartCrop Technologies',
        projectTitle: 'Ultra-low Power LoRa Soil & Weather Sensor Node PCB',
        projectCategory: 'PCB / Embedded Systems',
        dimensions: '50mm x 50mm max',
      }));
    } else if (presetType === 'skid') {
      setCategory('Electrical');
      setRawText(
        'Client requests a quotation for electrical distribution and VFD panels for 3x 22kW booster pumps operating in lead-lag-standby. Supply is 415V 3-phase 50Hz. Needs Modbus communication to existing Honeywell SCADA and IP55 outdoor stainless steel enclosure.'
      );
      setManualForm((prev) => ({
        ...prev,
        clientName: 'Metropolitan Water Authority',
        projectTitle: 'Triple 22kW Booster Pump VFD Distribution Panel',
        supplyVoltage: '415V',
        phase: '3-Phase',
        frequency: '50Hz',
      }));
    }
  };

  // Handle file uploads (reading as base64 for multimodal Gemini processing)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds the 20MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            base64,
            previewUrl: file.type.startsWith('image/') ? base64 : undefined,
          },
        ]);
      };
      reader.onerror = () => {
        setErrorMessage(`Failed to read file "${file.name}".`);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleManualFormChange = (field: keyof ManualRequirementFormData, val: string) => {
    setManualForm((prev) => ({ ...prev, [field]: val }));
  };

  // Perform Analysis via server-side Gemini endpoint
  const handleAnalyse = async () => {
    setErrorMessage(null);

    const trimmedText = rawText.trim();
    const hasManualData = Object.values(manualForm).some(
      (v) => typeof v === 'string' && v.trim().length > 0
    );
    const hasFiles = uploadedFiles.length > 0;

    if (!trimmedText && !hasManualData && !hasFiles) {
      setErrorMessage(
        'Please provide client requirements. You can paste a message, enter manual specifications, or upload documents, images, or audio.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Initiating engineering requirement inspection...');

    try {
      setAnalysisStep('Parsing technical parameters and equipment ratings...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('Evaluating feasibility, engineering risks, and potential conflicts...');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: trimmedText,
          category,
          manualForm: hasManualData ? manualForm : undefined,
          files: uploadedFiles.map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
            base64: f.base64,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server returned ${response.status}: ${response.statusText}`
        );
      }

      setAnalysisStep('Structuring preliminary BOQ, scope of work, and client questions...');
      const resultData: AnalysisResult = await response.json();

      const newRecord: AnalysisRecord = {
        id: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectName:
          resultData.projectSummary.title ||
          manualForm.projectTitle ||
          `Engineering Requirement (${category})`,
        clientName: manualForm.clientName || 'Client',
        category: (resultData.projectSummary.category as EngineeringCategory) || category,
        inputMethod:
          activeTab === 'message'
            ? 'Paste Client Message'
            : activeTab === 'manual'
            ? 'Enter Manually'
            : activeTab === 'document'
            ? 'Upload Document'
            : activeTab === 'image'
            ? 'Upload Image'
            : 'Upload Audio',
        rawInputText: trimmedText,
        manualForm,
        filesSummary: uploadedFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
        completenessScore: resultData.completeness.overallPercentage || 50,
        riskLevel:
          resultData.risks.some((r) => r.level === 'HIGH') || resultData.conflicts.length > 0
            ? 'HIGH'
            : resultData.risks.some((r) => r.level === 'MEDIUM')
            ? 'MEDIUM'
            : 'LOW',
        status:
          resultData.completeness.overallPercentage >= 80 ? 'Quoted' : 'Needs Clarification',
        result: resultData,
      };

      onAnalysisSuccess(newRecord);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message ||
          'Analysis could not be completed. Please check your network and verify server settings.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            New Requirement Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Input unstructured client notes, emails, specification documents, schematics, or voice recordings.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
            Engineering Category:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EngineeringCategory)}
            className="text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-2xs"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Quick Loader Buttons */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Quick Test Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadPreset('control-panel')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-blue-100 text-blue-800 rounded-md border border-blue-200 shadow-2xs transition-colors"
          >
            7.5kW Motor & Pumps Panel
          </button>
          <button
            type="button"
            onClick={() => loadPreset('solar-conflict')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 shadow-2xs transition-colors"
          >
            5kW Inverter vs 7.5kW Pump (Conflict)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('lora-pcb')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-blue-100 text-blue-800 rounded-md border border-blue-200 shadow-2xs transition-colors"
          >
            IoT LoRa Sensor PCB
          </button>
          <button
            type="button"
            onClick={() => loadPreset('skid')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-blue-100 text-blue-800 rounded-md border border-blue-200 shadow-2xs transition-colors"
          >
            Triple 22kW VFD Skid
          </button>
        </div>
      </div>

      {/* Input Method Selector Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
            Input Method:
          </span>
          {[
            { id: 'message' as InputTab, label: 'A. Paste Client Message', icon: MessageSquare },
            { id: 'document' as InputTab, label: 'B. Upload Document', icon: FileText },
            { id: 'image' as InputTab, label: 'C. Upload Image', icon: ImageIcon },
            { id: 'audio' as InputTab, label: 'D. Upload Audio', icon: Mic },
            { id: 'manual' as InputTab, label: 'E. Enter Manually', icon: SlidersHorizontal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'manual') setShowManualForm(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Input Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Textarea Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {activeTab === 'message'
                  ? "Paste the client's requirement here..."
                  : activeTab === 'manual'
                  ? 'Client Requirement Context & Summary Notes:'
                  : 'Message / Additional Requirement Context:'}
              </label>
              <span className="text-[11px] text-slate-400">
                {rawText.length} characters entered
              </span>
            </div>
            <textarea
              rows={activeTab === 'manual' ? 3 : 6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="We need an automatic control panel for a 7.5 kW motor, two pumps and a conveyor. The system should operate automatically and have an emergency stop."
              className="w-full text-sm text-slate-800 bg-slate-50/50 border border-slate-300 rounded-lg p-3.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-sans leading-relaxed"
            />
          </div>

          {/* Upload Dropzone / Button for Document, Image, Audio */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Attach Technical Documents, Schematics, or Audio Recordings
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Accepted formats: <strong>PDF, DOCX, TXT, CSV</strong> (documents) &bull;{' '}
                  <strong>PNG, JPG, WEBP</strong> (schematics & nameplates) &bull;{' '}
                  <strong>MP3, WAV, WEBM</strong> (client voice notes).
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.webm,.ogg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="technical-file-input"
                />
                <label
                  htmlFor="technical-file-input"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  Select Files to Upload
                </label>
              </div>
            </div>

            {/* Uploaded File List Display */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt="preview"
                          className="w-8 h-8 rounded object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {file.type || 'Document'} &bull; {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Manual Structured Form */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="flex items-center justify-between w-full text-left p-3 rounded-lg bg-slate-100/70 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Manual Structured Engineering Form
                </span>
                <span className="text-[11px] text-slate-500">(All fields optional)</span>
              </div>
              {showManualForm ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Manual Form Content */}
            {showManualForm && (
              <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/40 space-y-5 text-xs">
                {/* Client & Project Info */}
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200">
                    1. Client & Project Overview
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Client Name</label>
                      <input
                        type="text"
                        value={manualForm.clientName}
                        onChange={(e) => handleManualFormChange('clientName', e.target.value)}
                        placeholder="e.g. Acme Industries Ltd"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Company</label>
                      <input
                        type="text"
                        value={manualForm.company}
                        onChange={(e) => handleManualFormChange('company', e.target.value)}
                        placeholder="Company name"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={manualForm.email}
                        onChange={(e) => handleManualFormChange('email', e.target.value)}
                        placeholder="client@example.com"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={manualForm.phone}
                        onChange={(e) => handleManualFormChange('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Project Title</label>
                      <input
                        type="text"
                        value={manualForm.projectTitle}
                        onChange={(e) => handleManualFormChange('projectTitle', e.target.value)}
                        placeholder="Project title"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Project Category</label>
                      <input
                        type="text"
                        value={manualForm.projectCategory}
                        onChange={(e) => handleManualFormChange('projectCategory', e.target.value)}
                        placeholder="e.g. Electrical / Automation"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Industry</label>
                      <input
                        type="text"
                        value={manualForm.industry}
                        onChange={(e) => handleManualFormChange('industry', e.target.value)}
                        placeholder="e.g. Water Treatment / Oil & Gas"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Project Objective</label>
                      <input
                        type="text"
                        value={manualForm.projectObjective}
                        onChange={(e) => handleManualFormChange('projectObjective', e.target.value)}
                        placeholder="Primary operational goal"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Electrical Specifications */}
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200">
                    2. Electrical & Power Parameters
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Supply Voltage</label>
                      <input
                        type="text"
                        value={manualForm.supplyVoltage}
                        onChange={(e) => handleManualFormChange('supplyVoltage', e.target.value)}
                        placeholder="e.g. 400V, 415V, 230V, 480V"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Phase</label>
                      <input
                        type="text"
                        value={manualForm.phase}
                        onChange={(e) => handleManualFormChange('phase', e.target.value)}
                        placeholder="e.g. 3-Phase 4-Wire, 1-Phase"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Frequency</label>
                      <input
                        type="text"
                        value={manualForm.frequency}
                        onChange={(e) => handleManualFormChange('frequency', e.target.value)}
                        placeholder="e.g. 50 Hz or 60 Hz"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Power / Total Load</label>
                      <input
                        type="text"
                        value={manualForm.powerLoad}
                        onChange={(e) => handleManualFormChange('powerLoad', e.target.value)}
                        placeholder="e.g. 15 kW, 50 kVA"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-4">
                      <label className="block text-slate-600 font-medium mb-1">Motor Information</label>
                      <input
                        type="text"
                        value={manualForm.motorInformation}
                        onChange={(e) => handleManualFormChange('motorInformation', e.target.value)}
                        placeholder="e.g. 1x 7.5kW motor, 2x 3kW pumps, starting method (DOL, Star-Delta, VFD)"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Control & Automation */}
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200">
                    3. Control, Automation & Instrumentation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">PLC Required</label>
                      <input
                        type="text"
                        value={manualForm.plc}
                        onChange={(e) => handleManualFormChange('plc', e.target.value)}
                        placeholder="e.g. Siemens S7-1200 / None"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">HMI / Display</label>
                      <input
                        type="text"
                        value={manualForm.hmi}
                        onChange={(e) => handleManualFormChange('hmi', e.target.value)}
                        placeholder="e.g. 7-inch touch screen / Pilot lamps"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Sensors</label>
                      <input
                        type="text"
                        value={manualForm.sensors}
                        onChange={(e) => handleManualFormChange('sensors', e.target.value)}
                        placeholder="e.g. 4-20mA pressure, float switches"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Communication</label>
                      <input
                        type="text"
                        value={manualForm.communication}
                        onChange={(e) => handleManualFormChange('communication', e.target.value)}
                        placeholder="e.g. Modbus RTU, Ethernet/IP, Profinet"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-4">
                      <label className="block text-slate-600 font-medium mb-1">Control Requirements</label>
                      <input
                        type="text"
                        value={manualForm.controlRequirements}
                        onChange={(e) => handleManualFormChange('controlRequirements', e.target.value)}
                        placeholder="Auto/Manual selector, Emergency Stop category, interlocks"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Mechanical & Site Conditions */}
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200">
                    4. Mechanical & Installation Environment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Dimensions</label>
                      <input
                        type="text"
                        value={manualForm.dimensions}
                        onChange={(e) => handleManualFormChange('dimensions', e.target.value)}
                        placeholder="e.g. 800x600x250mm"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Materials</label>
                      <input
                        type="text"
                        value={manualForm.materials}
                        onChange={(e) => handleManualFormChange('materials', e.target.value)}
                        placeholder="e.g. Mild steel, SS316, Aluminum"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Environmental Conditions</label>
                      <input
                        type="text"
                        value={manualForm.environmentalConditions}
                        onChange={(e) => handleManualFormChange('environmentalConditions', e.target.value)}
                        placeholder="e.g. IP65 outdoor, 45°C ambient, dusty"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Installation Location</label>
                      <input
                        type="text"
                        value={manualForm.installationLocation}
                        onChange={(e) => handleManualFormChange('installationLocation', e.target.value)}
                        placeholder="e.g. Indoor plant room, Rooftop"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Scope, Commercial & Timeline */}
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200">
                    5. Scope, Testing, Commercial & Timeline
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Installation Required?</label>
                      <input
                        type="text"
                        value={manualForm.installationRequired}
                        onChange={(e) => handleManualFormChange('installationRequired', e.target.value)}
                        placeholder="Yes (turnkey) / Supply only"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Testing Required</label>
                      <input
                        type="text"
                        value={manualForm.testingRequired}
                        onChange={(e) => handleManualFormChange('testingRequired', e.target.value)}
                        placeholder="FAT, Insulation resistance, SAT"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Documentation Required</label>
                      <input
                        type="text"
                        value={manualForm.documentationRequired}
                        onChange={(e) => handleManualFormChange('documentationRequired', e.target.value)}
                        placeholder="Wiring diagrams, GA drawing, Manual"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Delivery Deadline</label>
                      <input
                        type="text"
                        value={manualForm.deliveryDeadline}
                        onChange={(e) => handleManualFormChange('deliveryDeadline', e.target.value)}
                        placeholder="e.g. 4-6 weeks / 2026-11-30"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Budget</label>
                      <input
                        type="text"
                        value={manualForm.budget}
                        onChange={(e) => handleManualFormChange('budget', e.target.value)}
                        placeholder="e.g. $5,000 - $8,000"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Quantity</label>
                      <input
                        type="text"
                        value={manualForm.quantity}
                        onChange={(e) => handleManualFormChange('quantity', e.target.value)}
                        placeholder="e.g. 1 unit prototype / 10 batch"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">Other Specific Requirements</label>
                      <input
                        type="text"
                        value={manualForm.otherRequirements}
                        onChange={(e) => handleManualFormChange('otherRequirements', e.target.value)}
                        placeholder="Special compliance codes, specific brands (Schneider, ABB, Siemens)"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-800 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Analysis could not be completed.</div>
                  <div className="mt-0.5 text-red-700">{errorMessage}</div>
                  <div className="mt-1 text-slate-600 font-medium">
                    Your entered text and attachments have been preserved. You can click Retry Analysis.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAnalyse}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Analysis
              </button>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Gemini will verify parameters, separate confirmed vs missing data, and calculate completeness.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleAnalyse}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Requirement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>[ ANALYSE REQUIREMENT ]</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading status details during analysis */}
          {isAnalyzing && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>AI Engineering Analysis in Progress...</span>
              </div>
              <div className="text-xs text-blue-700 font-mono">{analysisStep}</div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
