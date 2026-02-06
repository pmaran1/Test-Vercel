
import { GoogleGenAI } from "@google/genai";

const elements = {
    envBadge: document.getElementById('env-badge'),
    keyDot: document.getElementById('key-dot'),
    keyStatus: document.getElementById('key-status'),
    verifyBtn: document.getElementById('verify-btn'),
    btnText: document.getElementById('btn-text'),
    loader: document.getElementById('loader'),
    resultBox: document.getElementById('result-box'),
    resultText: document.getElementById('result-text')
};

// 1. Initial State Check
const checkConfiguration = () => {
    const apiKey = process.env.API_KEY;
    const isVercel = window.location.hostname.includes('vercel.app');

    // Update Environment Badge
    elements.envBadge.textContent = isVercel ? 'Production (Vercel)' : 'Localhost';
    elements.envBadge.classList.add(isVercel ? 'text-indigo-400' : 'text-amber-400');

    // Update API Key Status
    if (apiKey && apiKey !== 'undefined' && apiKey !== '') {
        elements.keyDot.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
        elements.keyStatus.textContent = 'API_KEY Detected';
        elements.keyStatus.className = 'text-sm font-medium text-emerald-400';
    } else {
        elements.keyDot.className = 'w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
        elements.keyStatus.textContent = 'API_KEY Missing';
        elements.keyStatus.className = 'text-sm font-medium text-rose-400';
    }
};

// 2. Connectivity Test
const testConnection = async () => {
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        alert('Please add your API_KEY to Vercel Environment Variables before testing.');
        return;
    }

    // UI Feedback
    elements.verifyBtn.disabled = true;
    elements.btnText.textContent = 'Contacting Gemini...';
    elements.loader.classList.remove('hidden');
    elements.resultBox.classList.add('hidden');

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: 'Write a one-sentence inspiring slogan for a successful software deployment.',
        });

        const slogan = response.text || "Connection verified, but no text was returned.";
        
        elements.resultText.textContent = `"${slogan}"`;
        elements.resultBox.classList.remove('hidden');
    } catch (error) {
        console.error('Gemini Connection Error:', error);
        elements.resultText.textContent = `Error: ${error.message}. Ensure your API key is active and correctly set in Vercel.`;
        elements.resultText.className = 'text-rose-400 text-sm italic';
        elements.resultBox.classList.remove('hidden');
    } finally {
        elements.verifyBtn.disabled = false;
        elements.btnText.textContent = 'Test Gemini Connection';
        elements.loader.classList.add('hidden');
    }
};

// Event Listeners
elements.verifyBtn.addEventListener('click', testConnection);

// Bootstrap
document.addEventListener('DOMContentLoaded', checkConfiguration);
