import { AnalysisRecord, EngineeringCategory } from '../types/analysis';
import { INITIAL_ANALYSES } from '../data/sampleAnalyses';

const STORAGE_KEY = 'ecra_analyses_v1';
const SETTINGS_KEY = 'ecra_settings_v1';

export interface AppSettings {
  companyName: string;
  engineerName: string;
  engineerTitle: string;
  contactEmail: string;
  phone: string;
  currency: string;
  defaultCategory: EngineeringCategory;
  standardsPreference: string;
  emailSignature: string;
  disclaimerEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Apex Engineering Consulting',
  engineerName: 'Lead Systems Engineer',
  engineerTitle: 'Senior Electrical & Automation Consultant',
  contactEmail: 'engineering@apexconsulting.com',
  phone: '+1 (555) 234-5678',
  currency: 'USD ($)',
  defaultCategory: 'Auto Detect',
  standardsPreference: 'IEC / IEEE',
  emailSignature: 'Kind regards,\nEngineering Project Team\nApex Engineering Consulting',
  disclaimerEnabled: true,
};

export function getAnalyses(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANALYSES));
      return INITIAL_ANALYSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ANALYSES;
  } catch (e) {
    console.error('Failed to load analyses from localStorage:', e);
    return INITIAL_ANALYSES;
  }
}

export function saveAnalysis(record: AnalysisRecord): void {
  try {
    const existing = getAnalyses();
    const index = existing.findIndex((item) => item.id === record.id);
    let updated: AnalysisRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      updated = [record, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save analysis to localStorage:', e);
  }
}

export function deleteAnalysis(id: string): AnalysisRecord[] {
  try {
    const existing = getAnalyses();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete analysis from localStorage:', e);
    return [];
  }
}

export function duplicateAnalysis(id: string): AnalysisRecord | null {
  try {
    const existing = getAnalyses();
    const source = existing.find((item) => item.id === id);
    if (!source) return null;

    const newRecord: AnalysisRecord = {
      ...JSON.parse(JSON.stringify(source)),
      id: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      projectName: `${source.projectName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Needs Clarification',
    };

    saveAnalysis(newRecord);
    return newRecord;
  } catch (e) {
    console.error('Failed to duplicate analysis:', e);
    return null;
  }
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
