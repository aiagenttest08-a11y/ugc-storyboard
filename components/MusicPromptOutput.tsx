import React, { useState } from 'react';
import { CopyIcon, MusicIcon } from './icons';

interface MusicPromptOutputProps {
    prompt: string;
}

const MusicPromptOutput: React.FC<MusicPromptOutputProps> = ({ prompt }) => {
    const [copyText, setCopyText] = useState('Salin Prompt');

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopyText('Berhasil Disalin!');
        setTimeout(() => setCopyText('Salin Prompt'), 2000);
    };

    return (
        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-white flex items-center gap-3"><MusicIcon /> Prompt Musik (Suno AI)</h2>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors"
                >
                    <CopyIcon />
                    {copyText}
                </button>
            </div>
            <p className="text-gray-300 font-mono bg-gray-900/50 p-3 rounded-md">{prompt}</p>
        </div>
    );
};

export default MusicPromptOutput;
