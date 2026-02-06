
export enum Tone {
  PROFESSIONAL = 'Professional',
  CONCISE = 'Concise',
  FUN = 'Fun/Creative',
  CONVENTIONAL = 'Conventional Commits'
}

export interface CommitResult {
  message: string;
  description: string;
}

export interface AppState {
  input: string;
  tone: Tone;
  loading: boolean;
  result: CommitResult | null;
  error: string | null;
}
