
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ChatMessageCard from './components/ChatMessageCard';
import { parseWhatsAppChat } from './utils';
import { analyzeMessages } from './services/geminiService';
import { ChatSession, ChatMessage, ThreatLevel } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const messages = parseWhatsAppChat(text);
        setSession({
          fileName: file.name,
          messages,
          analyzed: false,
          threatCount: 0
        });
        setError(null);
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  const startAnalysis = async () => {
    if (!session || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // For demonstration, we analyze in batches of 10 to manage prompt token limits and responsiveness
      // In a real app, we might paginate or handle the whole context if small
      const BATCH_SIZE = 15;
      const messagesToAnalyze = session.messages.slice(0, BATCH_SIZE);
      
      const results = await analyzeMessages(messagesToAnalyze);
      
      const updatedMessages = session.messages.map(msg => {
        const analysis = results.find(r => r.messageId === msg.id);
        if (analysis) {
          return {
            ...msg,
            isThreat: analysis.isThreat,
            threatLevel: analysis.threatLevel,
            threatType: analysis.threatType,
            explanation: analysis.explanation
          };
        }
        return msg;
      });

      const threatCount = updatedMessages.filter(m => m.isThreat && m.threatLevel !== ThreatLevel.SAFE).length;

      setSession({
        ...session,
        messages: updatedMessages,
        analyzed: true,
        threatCount
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSession(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {!session ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/30 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Shield Your Conversations
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-lg">
              Upload your exported WhatsApp chat history (.txt) to automatically detect fraudulent messages using advanced Gemini NLP.
            </p>
            
            <label className="group relative flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500 transition-all bg-slate-900/50 hover:bg-slate-900 shadow-2xl">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-slate-300 font-bold group-hover:text-blue-400">Click to upload chat history</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">TXT only (Exported from WhatsApp)</p>
              </div>
              <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
            </label>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
              {[
                { title: 'Privacy First', desc: 'Processing is local to your session. No chats are stored on our servers.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { title: 'NLP Detection', desc: 'Gemini AI detects subtle social engineering and urgency patterns.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'Expert Logic', desc: 'Identifies phishing, banking scams, and malicious URLs instantly.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                  <div className="w-8 h-8 text-blue-500 mb-3">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-200 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 sticky top-4 z-10 shadow-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active Session</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
                </div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {session.fileName}
                  <span className="text-slate-500 font-normal text-sm">({session.messages.length} messages)</span>
                </h3>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button 
                  onClick={reset}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  Discard
                </button>
                <button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing || session.analyzed}
                  className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 ${
                    session.analyzed 
                      ? 'bg-green-600 text-white cursor-default' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning with NLP...
                    </>
                  ) : session.analyzed ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Analysis Complete
                    </>
                  ) : (
                    'Run Security Scan'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3 animate-in shake duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {session.analyzed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Threats Detected</p>
                  <p className={`text-5xl font-black ${session.threatCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {session.threatCount}
                  </p>
                  <p className="text-slate-400 text-sm mt-4">
                    {session.threatCount > 0 
                      ? 'Immediate attention required for highlighted messages.' 
                      : 'No critical threats identified in this sample.'}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Scan Insights</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">Phishing Detection</span>
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-semibold">Social Engineering</span>
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold">URL Verification</span>
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-semibold">NLP Behavioral Analysis</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                    The analysis utilizes the Gemini-3 Flash engine to scan for semantic cues, emotional manipulation, and suspicious technical patterns commonly used in modern cyberattacks.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] px-2 flex justify-between items-center">
                Chat History
                {!session.analyzed && <span className="text-blue-500/60 lowercase italic font-normal tracking-normal">Awaiting Scan...</span>}
              </h4>
              <div className="space-y-3">
                {session.messages.map((msg) => (
                  <ChatMessageCard key={msg.id} message={msg} />
                ))}
              </div>
              
              {session.messages.length > 15 && !session.analyzed && (
                <div className="text-center py-6 text-slate-500 text-sm italic">
                  Scroll to see all {session.messages.length} messages.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-slate-900 bg-slate-950 mt-20 text-center">
        <p className="text-slate-500 text-sm">
          SentinelChat &copy; {new Date().getFullYear()} &bull; AI-Powered Cybersecurity Tool
        </p>
        <p className="text-slate-600 text-xs mt-2 italic px-4">
          Disclaimer: This tool provides automated security analysis and should be used as a guideline. Always exercise caution with unsolicited messages.
        </p>
      </footer>
    </div>
  );
};

export default App;
