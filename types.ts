

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface CreativeBrief {
  imageUploadMode: 'model_and_product' | 'model_with_product';
  modelImage?: ImageFile;
  productImage?: ImageFile;
  combinedImage?: ImageFile;
  productLink: string;
  frameCount: number;
  productCategory: string;
  customProductCategory: string;
  targetAge: string;
  targetGender: string;
  aspectRatio: string;
  setting: SettingOption;
  musicStyle: string;
}

export interface FullScript {
  hook: string;
  body: string;
  cta: string;
}

export interface StoryboardFrame {
  visual_description: string;
  camera_angle: string;
  script_text: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
}

export type SettingOption = 'Sesuai Konteks AI' | 'Indoor' | 'Outdoor';