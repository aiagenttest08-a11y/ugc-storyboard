import React, { useState } from 'react';
import type { StoryboardFrame, LoadingState } from '../types';
import FrameCard from './FrameCard';
import { SpinnerIcon, FilmIcon, CloseIcon } from './icons';

// --- Image Preview Modal Component ---
interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-auto h-auto" onClick={e => e.stopPropagation()}>
        <img src={imageUrl} alt="Preview" className="block max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

// --- Progress Bar Component ---
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full max-w-sm bg-gray-700 rounded-full h-2.5 mt-4">
        <div 
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);


// --- Main Storyboard Preview Component ---
interface StoryboardPreviewProps {
  storyboard: StoryboardFrame[];
  loadingState: LoadingState;
  onRegenerate: (index: number) => void;
}

const StoryboardPreview: React.FC<StoryboardPreviewProps> = ({ storyboard, loadingState, onRegenerate }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isLoadingStoryboard = loadingState.isLoading && storyboard.length === 0;
  const isGeneratingImages = loadingState.isLoading && storyboard.some(f => f.isGenerating);

  if (isLoadingStoryboard) {
    return (
      <div className="w-full h-full bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-[500px]">
        <SpinnerIcon />
        <p className="mt-4 text-lg font-semibold text-purple-300">Membuat Storyboard</p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm text-center">{loadingState.message}</p>
        {typeof loadingState.progress === 'number' && (
            <>
                <ProgressBar progress={loadingState.progress} />
                <p className="mt-2 text-sm font-bold text-purple-300">{loadingState.progress}%</p>
            </>
        )}
      </div>
    );
  }

  if (storyboard.length === 0 && !loadingState.isLoading) {
    return (
        <div className="w-full h-full bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[500px]">
            <FilmIcon/>
            <h3 className="mt-4 text-xl font-bold">Storyboard Anda Akan Muncul di Sini</h3>
            <p className="mt-2 text-gray-400">Isi "Creative Brief" di sebelah kiri untuk memulai.</p>
        </div>
    )
  }

  return (
    <>
      <ImagePreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
      <div className="w-full">
         {isGeneratingImages && (
            <div className="mb-4 text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-purple-300 font-semibold flex items-center justify-center gap-3">
                    <SpinnerIcon/>
                    {loadingState.message}
                </p>
                {typeof loadingState.progress === 'number' && <ProgressBar progress={loadingState.progress} />}
            </div>
         )}
        <div className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 -mx-4 px-4">
          {storyboard.map((frame, index) => (
            <FrameCard key={index} frame={frame} index={index} onImageClick={setPreviewImage} onRegenerate={onRegenerate} />
          ))}
        </div>
      </div>
    </>
  );
};

export default StoryboardPreview;