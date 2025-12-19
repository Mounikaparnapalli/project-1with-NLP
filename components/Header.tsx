
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white py-6 px-8 border-b border-slate-700 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SentinelChat</h1>
            <p className="text-slate-400 text-sm font-medium">NLP-Powered Cyber Threat Detector</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <span className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">System Active</span>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">Documentation</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
