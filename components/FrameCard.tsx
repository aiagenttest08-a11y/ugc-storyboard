import React from 'react';
import type { StoryboardFrame } from '../types';
import { CameraIcon, DownloadIcon, RegenerateIcon, SpinnerIcon } from './icons';

interface FrameCardProps {
  frame: StoryboardFrame;
  index: number;
  onImageClick: (imageUrl: string) => void;
  onRegenerate: (index: number) => void;
}

const FrameCard: React.FC<FrameCardProps> = ({ frame, index, onImageClick, onRegenerate }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!frame.imageUrl) return;
    const link = document.createElement('a');
    link.href = frame.imageUrl;
    const mimeType = frame.imageUrl.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `storyboard-frame-${index + 1}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegenerate(index);
  }

  return (
    <div className="flex-shrink-0 w-72 md:w-80 bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 animate-fade-in">
      <div className="relative aspect-[9/16] bg-gray-700 flex items-center justify-center group">
        {(frame.isGenerating || !frame.imageUrl) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <SpinnerIcon />
          </div>
        )}
        {frame.imageUrl && (
          <>
            <img 
              src={frame.imageUrl} 
              alt={`Storyboard frame ${index + 1}`} 
              className={`w-full h-full object-cover transition-all ${frame.isGenerating ? 'blur-sm brightness-75' : 'cursor-pointer'}`}
              onClick={() => !frame.isGenerating && onImageClick(frame.imageUrl!)}
            />
             <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                    onClick={handleRegenerate}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50"
                    aria-label="Regenerate image"
                    disabled={frame.isGenerating}
                >
                    <RegenerateIcon />
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                    aria-label="Download image"
                    disabled={frame.isGenerating}
                >
                    <DownloadIcon />
                </button>
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-bold text-lg">Adegan {index + 1}</h3>
            <div className="flex-shrink-0 flex items-center text-xs bg-gray-700 text-purple-300 px-2 py-1 rounded-full">
                <CameraIcon />
                <span className="ml-1.5">{frame.camera_angle}</span>
            </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed h-24 overflow-y-auto">{frame.script_text}</p>
      </div>
    </div>
  );
};

export default FrameCard;
