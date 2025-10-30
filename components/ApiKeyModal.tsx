import React, { useState } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
    const [key, setKey] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(key);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
                <p className="text-center text-yellow-400 font-bold mb-4 text-lg">
                    masukan apikey kamu disini
                </p>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500 mb-4"
                    placeholder="*********************"
                />
                <button
                    onClick={handleSave}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                    Simpan & Lanjutkan
                </button>
            </div>
        </div>
    );
};

export default ApiKeyModal;