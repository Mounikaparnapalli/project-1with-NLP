
export enum ThreatLevel {
  SAFE = 'SAFE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  sender: string;
  content: string;
  isThreat?: boolean;
  threatLevel?: ThreatLevel;
  threatType?: string;
  explanation?: string;
}

export interface AnalysisResult {
  messageId: string;
  isThreat: boolean;
  threatLevel: ThreatLevel;
  threatType: string;
  explanation: string;
}

export interface ChatSession {
  fileName: string;
  messages: ChatMessage[];
  analyzed: boolean;
  threatCount: number;
}
