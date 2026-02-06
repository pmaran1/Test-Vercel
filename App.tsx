
import React, { useState } from 'react';
import { Tone, AppState, CommitResult } from './types';
import { generateCommitMessage } from './services/geminiService';

// Reusable Icon Components
const GithubIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
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
    // Simple toast would be nice, but keeping it clean
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
        <div className="hidden sm:block text-slate-400 text-sm">
          Simple • Fast • Pro
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">What did you change?</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="e.g., I added a new login screen and fixed a bug in the auth service where tokens weren't refreshing properly."
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
                {state.loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : 'Generate Message'}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {state.error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {/* Result Area */}
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
                  <span className="text-indigo-400 font-medium">Why this message:</span> {state.result.description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-800/30 rounded-lg text-xs text-slate-500 italic">
              Pro tip: You can now copy this directly into your terminal before pushing to GitHub/Vercel.
            </div>
          </div>
        )}
      </main>

      {/* Footer / Demo Instructions */}
      <footer className="mt-auto py-12 text-center text-slate-500 space-y-4">
        <p className="text-sm">
          Built with <span className="text-indigo-400">Gemini 3 Flash</span> • React • Tailwind
        </p>
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 max-w-2xl mx-auto">
          <h4 className="text-slate-300 font-semibold mb-2">How to deploy this to Vercel:</h4>
          <ol className="text-left text-xs space-y-2 list-decimal list-inside text-slate-400">
            <li>Push this code to a new <span className="text-indigo-400 font-mono">GitHub</span> repository.</li>
            <li>Connect your repository to <span className="text-indigo-400 font-mono">Vercel</span> dashboard.</li>
            <li>Add your Gemini <span className="text-indigo-400 font-mono">API_KEY</span> in Vercel project settings (Environment Variables).</li>
            <li>Deploy! Your AI-powered dev tool is live.</li>
          </ol>
        </div>
      </footer>
    </div>
  );
};

export default App;
