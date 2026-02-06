
import React, { useState, useEffect } from 'react';
import { Tone, AppState, CommitResult } from './types';
import { generateCommitMessage } from './services/geminiService';

const GithubIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const VercelIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    input: '',
    tone: Tone.CONVENTIONAL,
    loading: false,
    result: null,
    error: null,
  });

  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if API key is present in environment
    const key = process.env.API_KEY;
    setIsConfigured(!!key && key !== "undefined" && key !== "");
  }, []);

  const handleGenerate = async () => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, error: 'Please describe your changes first.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, result: null }));

    try {
      const result = await generateCommitMessage(state.input, state.tone);
      setState(prev => ({ ...prev, result, loading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GithubIcon />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
            CommitWise AI
          </h1>
        </div>
        <div className="flex items-center gap-4">
           {isConfigured === false ? (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-medium bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                API Key Missing
              </div>
           ) : (
             <div className="hidden sm:flex items-center gap-2 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
               <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
               Vercel Live Demo
             </div>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">What did you change?</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="e.g., I updated the deployment config and fixed the Vercel build errors."
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Style / Tone</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                value={state.tone}
                onChange={(e) => setState(prev => ({ ...prev, tone: e.target.value as Tone }))}
              >
                {Object.values(Tone).map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={state.loading}
                className={`w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2`}
              >
                {state.loading ? 'Analyzing...' : 'Generate Message'}
              </button>
            </div>
          </div>
        </div>

        {state.error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm whitespace-pre-wrap">
            <strong>Error:</strong> {state.error}
            {state.error.includes("API_KEY") && (
              <div className="mt-2 text-xs opacity-80">
                Go to Vercel Settings > Environment Variables and add "API_KEY" with your Gemini key.
              </div>
            )}
          </div>
        )}

        {state.result && (
          <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-px bg-slate-800 w-full" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Suggested Commit</h3>
                <button 
                  onClick={() => copyToClipboard(state.result?.message || '')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mono">
                <code className="text-emerald-400 text-lg break-all">
                  git commit -m "{state.result.message}"
                </code>
              </div>
              <div className="bg-indigo-900/10 border border-indigo-900/30 rounded-xl p-5">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <span className="text-indigo-400 font-medium">AI Reasoning:</span> {state.result.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Deployment Integration Footer */}
      <footer className="mt-auto py-12 text-center text-slate-500 space-y-8 w-full">
        <div className="flex justify-center items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <GithubIcon />
            <span className="text-sm font-medium">GitHub</span>
          </div>
          <div className="w-8 h-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <VercelIcon />
            <span className="text-sm font-medium">Vercel</span>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 max-w-2xl mx-auto backdrop-blur-sm">
          <h4 className="text-slate-300 font-semibold mb-4 flex items-center justify-center gap-2">
            <VercelIcon /> Vercel Deployment Guide
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className="text-indigo-400 font-bold mb-1">1. Link</div>
              <p className="text-[10px] text-slate-400 leading-tight">Connect your GitHub repo to a New Project on Vercel.</p>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className="text-indigo-400 font-bold mb-1">2. Env</div>
              <p className="text-[10px] text-slate-400 leading-tight">Add `API_KEY` to Environment Variables in Vercel settings.</p>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className="text-indigo-400 font-bold mb-1">3. Ship</div>
              <p className="text-[10px] text-slate-400 leading-tight">Hit Deploy. The `vercel.json` and `package.json` handle the rest.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
