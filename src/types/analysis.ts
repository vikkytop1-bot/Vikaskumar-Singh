export type EngineeringCategory =
  | 'Auto Detect'
  | 'Electrical'
  | 'Electronics'
  | 'Mechanical'
  | 'Automation / PLC'
  | 'Solar / Renewable Energy'
  | 'PCB / Embedded Systems'
  | 'MATLAB / Simulink'
  | 'Mixed Engineering';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type CompletenessRating =
  | 'Very incomplete'
  | 'Incomplete'
  | 'Partially complete'
  | 'Mostly complete'
  | 'Ready for detailed quotation';

export type FeasibilityStatus =
  | 'Potentially feasible'
  | 'Needs further information'
  | 'Potential technical concern';

export type ProjectStatus =
  | 'Under Review'
  | 'Needs Clarification'
  | 'Quoted'
  | 'In Progress'
  | 'Completed';

export interface ManualRequirementFormData {
  clientName?: string;
  company?: string;
  email?: string;
  phone?: string;
  projectTitle?: string;
  projectCategory?: string;
  industry?: string;
  projectObjective?: string;
  supplyVoltage?: string;
  phase?: string;
  frequency?: string;
  powerLoad?: string;
  motorInformation?: string;
  controlRequirements?: string;
  plc?: string;
  hmi?: string;
  sensors?: string;
  communication?: string;
  mechanicalRequirements?: string;
  dimensions?: string;
  materials?: string;
  environmentalConditions?: string;
  installationLocation?: string;
  installationRequired?: string;
  testingRequired?: string;
  documentationRequired?: string;
  budget?: string;
  quantity?: string;
  deliveryDeadline?: string;
  otherRequirements?: string;
}

export interface UploadedFileItem {
  name: string;
  type: string;
  size: number;
  base64?: string;
  previewUrl?: string;
}

export interface ProjectSummary {
  title: string;
  category: string;
  industry: string;
  clientObjective: string;
  overallSummary: string;
}

export interface RequirementCompleteness {
  overallPercentage: number;
  ratingLabel: CompletenessRating;
  categories: {
    technical: number;
    electrical: number;
    mechanical: number;
    controlAutomation: number;
    installation: number;
    commercial: number;
    timeline: number;
  };
}

export interface ConfirmedRequirements {
  electrical: string[];
  electronics: string[];
  mechanical: string[];
  softwareControl: string[];
  installation: string[];
  commercial: string[];
  timeline: string[];
}

export interface MissingInfoItem {
  item: string;
  whyItMatters: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
}

export interface ClientQuestionItem {
  id?: string;
  question: string;
  category?: string;
  rationale?: string;
}

export interface ScopeOfWorkItem {
  category:
    | 'Design'
    | 'Engineering'
    | 'Procurement'
    | 'Fabrication'
    | 'Programming'
    | 'Installation'
    | 'Testing'
    | 'Commissioning'
    | 'Documentation';
  description: string;
  status: 'CONFIRMED' | 'OPTIONAL / NEEDS CONFIRMATION';
}

export interface PreliminaryBOQItem {
  item: string;
  description: string;
  specification: string;
  quantity: string;
  basis: string;
  confidence: 'High' | 'Medium' | 'Low' | 'TBD';
}

export interface EngineeringRiskItem {
  risk: string;
  whyItMatters: string;
  level: RiskLevel;
  mitigation: string;
}

export interface RequirementConflictItem {
  conflict: string;
  whyProblem: string;
  requiredResolution: string;
}

export interface EngineeringAssumptionItem {
  assumption: string;
  basis: string;
  riskIfWrong: string;
}

export interface PreliminaryFeasibility {
  status: FeasibilityStatus;
  summary: string;
  engineeringReviewNotes: string;
}

export interface AnalysisResult {
  projectSummary: ProjectSummary;
  completeness: RequirementCompleteness;
  confirmedRequirements: ConfirmedRequirements;
  missingInformation: MissingInfoItem[];
  clientQuestions: ClientQuestionItem[];
  scopeOfWork: ScopeOfWorkItem[];
  preliminaryBOQ: PreliminaryBOQItem[];
  risks: EngineeringRiskItem[];
  conflicts: RequirementConflictItem[];
  assumptions: EngineeringAssumptionItem[];
  feasibility: PreliminaryFeasibility;
  recommendedNextAction: string;
}

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  projectName: string;
  clientName: string;
  category: EngineeringCategory;
  inputMethod: string;
  rawInputText: string;
  manualForm?: ManualRequirementFormData;
  filesSummary?: Array<{ name: string; type: string; size: number }>;
  completenessScore: number;
  riskLevel: RiskLevel;
  status: ProjectStatus;
  result: AnalysisResult;
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  category: EngineeringCategory;
  description: string;
  iconName: string;
  sampleMessage: string;
  defaultFormData: Partial<ManualRequirementFormData>;
  keyQuestionsToCheck: string[];
}
