import React, { useState } from 'react';
import type { FullScript } from '../types';
import { CopyIcon } from './icons';

interface ScriptOutputProps {
    script: FullScript;
}

const ScriptOutput: React.FC<ScriptOutputProps> = ({ script }) => {
    const [copyText, setCopyText] = useState('Salin Skrip');

    const handleCopy = () => {
        const fullScriptText = `[HOOK]\n${script.hook}\n\n[BODY]\n${script.body}\n\n[CTA]\n${script.cta}`;
        navigator.clipboard.writeText(fullScriptText);
        setCopyText('Berhasil Disalin!');
        setTimeout(() => setCopyText('Salin Skrip'), 2000);
    };

    return (
        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Naskah Konten Lengkap</h2>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors"
                >
                    <CopyIcon />
                    {copyText}
                </button>
            </div>
            <div className="space-y-4 text-gray-300">
                <div>
                    <h3 className="font-semibold text-purple-400 mb-1">🎬 HOOK (Pembuka)</h3>
                    <p className="pl-4 border-l-2 border-purple-500">{script.hook}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-purple-400 mb-1">📝 BODY (Isi Konten)</h3>
                    <p className="pl-4 border-l-2 border-purple-500 whitespace-pre-line">{script.body}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-purple-400 mb-1">🛒 CTA (Call to Action)</h3>
                    <p className="pl-4 border-l-2 border-purple-500">{script.cta}</p>
                </div>
            </div>
        </div>
    );
};

export default ScriptOutput;
