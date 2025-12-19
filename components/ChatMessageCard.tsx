
import React from 'react';
import { ChatMessage, ThreatLevel } from '../types';

interface ChatMessageCardProps {
  message: ChatMessage;
}

const ChatMessageCard: React.FC<ChatMessageCardProps> = ({ message }) => {
  const isThreat = message.isThreat && message.threatLevel !== ThreatLevel.SAFE;

  const getLevelStyles = (level?: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.CRITICAL: return 'bg-red-900/30 border-red-500 text-red-200';
      case ThreatLevel.HIGH: return 'bg-orange-900/30 border-orange-500 text-orange-200';
      case ThreatLevel.MEDIUM: return 'bg-yellow-900/30 border-yellow-500 text-yellow-200';
      case ThreatLevel.LOW: return 'bg-blue-900/30 border-blue-500 text-blue-200';
      default: return 'bg-slate-800 border-slate-700 text-slate-200';
    }
  };

  const getBadgeStyles = (level?: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.CRITICAL: return 'bg-red-500 text-white';
      case ThreatLevel.HIGH: return 'bg-orange-500 text-white';
      case ThreatLevel.MEDIUM: return 'bg-yellow-500 text-slate-900';
      case ThreatLevel.LOW: return 'bg-blue-500 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 transition-all duration-300 ${getLevelStyles(message.threatLevel)} ${isThreat ? 'shadow-lg shadow-red-900/20 scale-[1.01]' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-100">{message.sender}</span>
          <span className="text-xs text-slate-400">{message.timestamp}</span>
        </div>
        {isThreat && (
          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${getBadgeStyles(message.threatLevel)}`}>
            {message.threatType || 'Threat Detected'}
          </span>
        )}
      </div>
      
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>

      {isThreat && message.explanation && (
        <div className="mt-4 pt-3 border-t border-red-500/30 flex gap-3 items-start">
          <div className="p-1.5 bg-red-500 rounded-full mt-0.5 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-0.5">Analysis</p>
            <p className="text-xs italic text-slate-300 leading-relaxed">
              {message.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessageCard;
