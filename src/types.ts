import { OrthopedicSubspecialty, SubspecialtyProfile } from './lib/subspecialty-detector';
import { ReportingGuideline } from './lib/reporting-guidelines';
import { LiteratureBundle } from './lib/literature-engine';

export interface Step {
  id: number;
  name: string;
  phase: 'A' | 'B' | 'C' | 'D' | 'E';
  phaseColor: string;
}

export interface StepOutput {
  [key: number]: string;
}

export type StepStatus = 'idle' | 'running' | 'done' | 'error';

export interface StepStatuses {
  [key: number]: StepStatus;
}

export interface AppState {
  detectedSubspecialty: OrthopedicSubspecialty;
  subspecialtyProfile: SubspecialtyProfile | null;
  reportingGuideline: ReportingGuideline;
  targetJournal: string;
  literatureBundle: LiteratureBundle | null;
}
