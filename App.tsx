import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import StoryboardPreview from './components/StoryboardPreview';
import ScriptOutput from './components/ScriptOutput';
import MusicPromptOutput from './components/MusicPromptOutput';
import ApiKeyModal from './components/ApiKeyModal';
import { generateStoryboardAndScript, generateImageForFrame } from './services/geminiService';
import type { CreativeBrief, FullScript, StoryboardFrame, LoadingState } from './types';

const App: React.FC = () => {
    const [creativeBrief, setCreativeBrief] = useState<CreativeBrief | null>(null);
    const [script, setScript] = useState<FullScript | null>(null);
    const [storyboard, setStoryboard] = useState<StoryboardFrame[]>([]);
    const [musicPrompt, setMusicPrompt] = useState<string>('');
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, message: '' });
    const [apiKey, setApiKey] = useState<string>('');
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    useEffect(() => {
        const storedApiKey = localStorage.getItem('gemini-api-key');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        } else {
            setIsApiKeyModalOpen(true);
        }
    }, []);

    const handleSaveApiKey = (key: string) => {
        if (key.trim()) {
            setApiKey(key);
            localStorage.setItem('gemini-api-key', key);
            setIsApiKeyModalOpen(false);
        }
    };
    
    const handleReset = () => {
        setCreativeBrief(null);
        setScript(null);
        setStoryboard([]);
        setMusicPrompt('');
        setLoadingState({ isLoading: false, message: '' });
    };

    const runImageGenerationPipeline = async (brief: CreativeBrief, generatedStoryboard: StoryboardFrame[]) => {
        setLoadingState({
            isLoading: true,
            message: 'Membuat visual untuk setiap adegan...',
            progress: 0,
        });

        const storyboardWithImages = [...generatedStoryboard];

        for (let i = 0; i < storyboardWithImages.length; i++) {
            const frame = storyboardWithImages[i];
            try {
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                const imageUrl = await generateImageForFrame(frame, brief, apiKey);
                
                setStoryboard(prev => {
                    const newStoryboard = [...prev];
                    if (newStoryboard[i]) {
                        newStoryboard[i] = { ...newStoryboard[i], imageUrl, isGenerating: false };
                    }
                    return newStoryboard;
                });

            } catch (e) {
                console.error(`Failed to generate image for frame ${i + 1}`, e);
                setStoryboard(prev => {
                    const newStoryboard = [...prev];
                    if (newStoryboard[i]) {
                       newStoryboard[i].isGenerating = false;
                    }
                    return newStoryboard;
                });
            } finally {
                setLoadingState(prev => ({
                    ...prev,
                    progress: ((i + 1) / generatedStoryboard.length) * 100
                }));
            }
        }
        
        setLoadingState({ isLoading: false, message: '', progress: 100 });
    };

    const handleFormSubmit = async (brief: CreativeBrief) => {
        if (!apiKey) {
            setIsApiKeyModalOpen(true);
            return;
        }
        handleReset();
        setCreativeBrief(brief);
        setLoadingState({ isLoading: true, message: 'Menganalisis brief dan membuat naskah...', progress: 0 });

        try {
            const result = await generateStoryboardAndScript(brief, apiKey);
            
            setScript(result.script);
            setMusicPrompt(result.music_prompt);
            
            const initialStoryboard = result.storyboard.map(frame => ({ ...frame, isGenerating: true }));
            setStoryboard(initialStoryboard);

            await runImageGenerationPipeline(brief, initialStoryboard);

        } catch (error) {
            console.error(error);
            setLoadingState({ isLoading: false, message: `Error: ${(error as Error).message}` });
        }
    };

    const handleRegenerateImage = async (index: number) => {
        if (!apiKey) {
            setIsApiKeyModalOpen(true);
            return;
        }
        if (!creativeBrief || !storyboard[index]) return;
        
        setStoryboard(prev => {
            const newStoryboard = [...prev];
            newStoryboard[index] = { ...newStoryboard[index], isGenerating: true, imageUrl: undefined };
            return newStoryboard;
        });

        try {
            const imageUrl = await generateImageForFrame(storyboard[index], creativeBrief, apiKey);
            setStoryboard(prev => {
                const newStoryboard = [...prev];
                newStoryboard[index] = { ...newStoryboard[index], imageUrl, isGenerating: false };
                return newStoryboard;
            });
        } catch (error) {
             console.error(`Failed to regenerate image for frame ${index + 1}`, error);
             setStoryboard(prev => {
                const newStoryboard = [...prev];
                newStoryboard[index].isGenerating = false;
                return newStoryboard;
            });
        }
    };

    return (
        <>
            <ApiKeyModal isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} />
            <div className="bg-gray-900 text-white min-h-screen font-sans">
                <main className="container mx-auto px-4 py-8">
                    <header className="text-center mb-10 relative">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            AI Storyboard Generator
                        </h1>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                            Ubah ide konten Anda menjadi storyboard visual dan naskah lengkap dalam hitungan detik.
                        </p>
                        <div className="absolute top-0 right-0 flex items-center">
                            <span className="text-xs text-gray-500 mr-4">credit by UGCSHAPER</span>
                            <button 
                                onClick={() => setIsApiKeyModalOpen(true)}
                                className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
                            >
                                API Key
                            </button>
                        </div>
                    </header>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 lg:sticky lg:top-8">
                            <InputPanel onSubmit={handleFormSubmit} isLoading={loadingState.isLoading} />
                        </div>
                        
                        <div className="space-y-8">
                             <StoryboardPreview 
                                storyboard={storyboard} 
                                loadingState={loadingState} 
                                onRegenerate={handleRegenerateImage}
                            />
                            {script && <ScriptOutput script={script} />}
                            {musicPrompt && <MusicPromptOutput prompt={musicPrompt} />}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;