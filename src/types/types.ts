
export interface ImprovementPoint {
  issue: string;
  suggestion: string;
  location: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface GrammarIssue {
  issue: string;
  location: string;
  originalText: string;
  correctedText: string;
  explanation: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: ImprovementPoint[];
  missingKeywords: string[];
  improvementTips: string[];
  atsCompatibility: number;
  grammarAndStyleScore: number;
  experienceRelevanceScore: number;
  suggestedRoles: string[];
  layoutSuggestions?: string[];
  grammarIssues?: GrammarIssue[];
  ats100Checklist?: string[];
}

export type ProcessingStatus = 'idle' | 'extracting' | 'analyzing' | 'optimizing' | 'completed' | 'error';

export interface AppState {
  status: ProcessingStatus;
  result: AnalysisResult | null;
  error: string | null;
  fileName: string | null;
}
