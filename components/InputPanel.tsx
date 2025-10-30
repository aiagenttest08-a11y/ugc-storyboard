// Fix: Added content for components/InputPanel.tsx.
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import {
  ASPECT_RATIOS,
  FRAME_COUNT_OPTIONS,
  MUSIC_STYLES,
  PRODUCT_CATEGORIES,
  SETTING_OPTIONS,
  TARGET_AGES,
  TARGET_GENDERS,
} from '../constants';
import type { CreativeBrief, ImageFile, SettingOption } from '../types';
import { SpinnerIcon, UploadIcon, ReplaceIcon } from './icons';

interface InputPanelProps {
  onSubmit: (brief: CreativeBrief) => void;
  isLoading: boolean;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const ImageUpload: React.FC<{
  image: ImageFile | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onButtonClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  label: string;
}> = ({ image, onFileChange, onButtonClick, fileInputRef, label }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div
      onClick={onButtonClick}
      className="aspect-video w-full bg-gray-700 rounded-lg border-2 border-dashed border-gray-500 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-600 transition-colors"
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />
      {image ? (
        <div className="relative w-full h-full">
          <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="w-full h-full object-contain rounded-lg p-1" />
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
            <div className="text-center text-white">
              <ReplaceIcon />
              <p className="text-xs mt-1">{image.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <UploadIcon />
          <p className="mt-2 text-sm">Klik untuk mengunggah</p>
          <p className="text-xs">PNG, JPG, WEBP</p>
        </div>
      )}
    </div>
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: readonly (string | number)[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{String(opt)}</option>
      ))}
    </select>
  </div>
);

const InputPanel: React.FC<InputPanelProps> = ({ onSubmit, isLoading }) => {
  const [imageUploadMode, setImageUploadMode] = useState<'model_and_product' | 'model_with_product'>('model_and_product');
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [combinedImage, setCombinedImage] = useState<ImageFile | null>(null);
  const [productLink, setProductLink] = useState('');
  const [frameCount, setFrameCount] = useState<number>(5);
  const [productCategory, setProductCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [customProductCategory, setCustomProductCategory] = useState('');
  const [targetAge, setTargetAge] = useState(TARGET_AGES[0]);
  const [targetGender, setTargetGender] = useState(TARGET_GENDERS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [setting, setSetting] = useState<SettingOption>(SETTING_OPTIONS[0]);
  const [musicStyle, setMusicStyle] = useState(MUSIC_STYLES[0]);

  const modelImageRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);
  const combinedImageRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<ImageFile | null>>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await toBase64(file);
        setImage({ base64, mimeType: file.type, name: file.name });
      } catch (error) {
        console.error('Error converting file to base64', error);
        alert('Gagal memproses file gambar.');
      }
    }
    event.target.value = ''; // Reset file input
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (imageUploadMode === 'model_and_product' && (!modelImage || !productImage)) {
      alert('Silakan unggah gambar model dan produk.');
      return;
    }
    if (imageUploadMode === 'model_with_product' && !combinedImage) {
      alert('Silakan unggah gambar model dengan produk.');
      return;
    }
    if (!productLink.trim()) {
      alert('Silakan masukkan link produk.');
      return;
    }
     if (productCategory === 'Lainnya...' && !customProductCategory.trim()) {
      alert('Silakan masukkan kategori produk kustom.');
      return;
    }

    const brief: CreativeBrief = {
      imageUploadMode,
      modelImage: imageUploadMode === 'model_and_product' ? modelImage! : undefined,
      productImage: imageUploadMode === 'model_and_product' ? productImage! : undefined,
      combinedImage: imageUploadMode === 'model_with_product' ? combinedImage! : undefined,
      productLink,
      frameCount,
      productCategory,
      customProductCategory,
      targetAge,
      targetGender,
      aspectRatio: aspectRatio.split(' ')[0],
      setting,
      musicStyle,
    };
    onSubmit(brief);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Creative Brief</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Mode Unggah Gambar</label>
        <div className="flex gap-4">
          <button type="button" onClick={() => setImageUploadMode('model_and_product')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${imageUploadMode === 'model_and_product' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Model & Produk Terpisah</button>
          <button type="button" onClick={() => setImageUploadMode('model_with_product')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${imageUploadMode === 'model_with_product' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Model & Produk Digabung</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageUploadMode === 'model_and_product' ? (
          <>
            <ImageUpload image={modelImage} onFileChange={(e) => handleFileChange(e, setModelImage)} onButtonClick={() => modelImageRef.current?.click()} fileInputRef={modelImageRef} label="Gambar Referensi Model" />
            <ImageUpload image={productImage} onFileChange={(e) => handleFileChange(e, setProductImage)} onButtonClick={() => productImageRef.current?.click()} fileInputRef={productImageRef} label="Gambar Referensi Produk" />
          </>
        ) : (
          <div className="md:col-span-2">
            <ImageUpload image={combinedImage} onFileChange={(e) => handleFileChange(e, setCombinedImage)} onButtonClick={() => combinedImageRef.current?.click()} fileInputRef={combinedImageRef} label="Gambar Referensi Model & Produk" />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="productLink" className="block text-sm font-medium text-gray-300 mb-2">Link Produk (Tokopedia, Shopee, etc)</label>
        <input
          id="productLink"
          type="url"
          value={productLink}
          onChange={(e) => setProductLink(e.target.value)}
          required
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
          placeholder="https://..."
        />
      </div>

      <SelectInput label="Jumlah Adegan/Frame" value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))} options={FRAME_COUNT_OPTIONS} />
      
       <div>
        <SelectInput label="Kategori Produk" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} options={PRODUCT_CATEGORIES} />
        {productCategory === 'Lainnya...' && (
          <input
            type="text"
            value={customProductCategory}
            onChange={(e) => setCustomProductCategory(e.target.value)}
            required
            className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
            placeholder="Contoh: Aksesoris Gaming"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput label="Target Usia" value={targetAge} onChange={(e) => setTargetAge(e.target.value)} options={TARGET_AGES} />
        <SelectInput label="Target Gender" value={targetGender} onChange={(e) => setTargetGender(e.target.value)} options={TARGET_GENDERS} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput label="Rasio Aspek Video" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} options={ASPECT_RATIOS} />
        <SelectInput label="Setting Latar" value={setting} onChange={(e) => setSetting(e.target.value as SettingOption)} options={SETTING_OPTIONS} />
      </div>
      
      <SelectInput label="Gaya Musik" value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)} options={MUSIC_STYLES} />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? <><SpinnerIcon /> <span className="ml-2">Sedang Membuat...</span></> : 'Buat Storyboard & Naskah'}
      </button>
    </form>
  );
};

export default InputPanel;
