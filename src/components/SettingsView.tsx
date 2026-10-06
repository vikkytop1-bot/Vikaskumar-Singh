import React, { useState, useEffect } from 'react';
import {
  Save,
  Check,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  Coins,
  Cpu,
  FileCheck,
  Server,
  RefreshCw,
} from 'lucide-react';
import { AppSettings, saveSettings } from '../utils/storage';
import { EngineeringCategory } from '../types/analysis';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    hasApiKey: boolean;
    checked: boolean;
  }>({ status: 'checking', hasApiKey: false, checked: false });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus({
          status: data.status || 'ok',
          hasApiKey: data.hasApiKey ?? true,
          checked: true,
        });
      })
      .catch(() => {
        setHealthStatus({ status: 'offline', hasApiKey: false, checked: true });
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Application & Engineering Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your engineering consulting profile, client email templates, and standard preferences.
        </p>
      </div>

      {/* Backend & AI Health Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Server-Side AI Engine Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gemini 3.8 Flash model via secure server-side proxy route. All API credentials remain protected server-side.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              healthStatus.hasApiKey
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus.hasApiKey ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            />
            {healthStatus.hasApiKey ? 'AI Engine Ready' : 'API Key Pending'}
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Section 1: Firm & Engineer Profile */}
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            1. Consultant & Engineering Practice Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Firm Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Engineer Name</label>
              <input
                type="text"
                value={formData.engineerName}
                onChange={(e) => setFormData({ ...formData, engineerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Professional Title</label>
              <input
                type="text"
                value={formData.engineerTitle}
                onChange={(e) => setFormData({ ...formData, engineerTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quotation Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
                <option value="AUD ($)">AUD ($)</option>
                <option value="CAD ($)">CAD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Engineering Standard & Analysis Preferences */}
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            2. Technical Standards & Defaults
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Standards Preference
              </label>
              <select
                value={formData.standardsPreference}
                onChange={(e) => setFormData({ ...formData, standardsPreference: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="IEC / IEEE">IEC / IEEE (International & European)</option>
                <option value="NEC / NFPA / NEMA">NEC / NFPA / NEMA (North America)</option>
                <option value="AS/NZS">AS/NZS (Australia & New Zealand)</option>
                <option value="ISO / BS">ISO / British Standards</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Engineering Category
              </label>
              <select
                value={formData.defaultCategory}
                onChange={(e) =>
                  setFormData({ ...formData, defaultCategory: e.target.value as EngineeringCategory })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Auto Detect">Auto Detect</option>
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
        </div>

        {/* Section 3: Client Email Signature & Disclaimers */}
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            3. Client Communication Draft Template
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Email Sign-off & Signature
              </label>
              <textarea
                rows={3}
                value={formData.emailSignature}
                onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-sans focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="disclaimerToggle"
                checked={formData.disclaimerEnabled}
                onChange={(e) => setFormData({ ...formData, disclaimerEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
              />
              <label htmlFor="disclaimerToggle" className="text-xs text-slate-700 cursor-pointer">
                <strong>Include engineering safety notice in all exported reports</strong>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Protects consulting liability by reminding clients that preliminary analyses require licensed verification prior to procurement.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
};
