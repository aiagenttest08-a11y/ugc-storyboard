import { GoogleGenAI, Modality } from "@google/genai";
import type { CreativeBrief, FullScript, StoryboardFrame } from '../types';

const buildStoryboardPrompt = (brief: CreativeBrief): string => {
  const {
    productLink,
    productCategory,
    customProductCategory,
    targetAge,
    targetGender,
    aspectRatio,
    setting,
    musicStyle,
    frameCount
  } = brief;

  const category = productCategory === 'Lainnya...' ? customProductCategory : productCategory;

  return `
    As a creative director for social media ads, create a complete creative package for a video ad based on this brief.
    **Output MUST be a single, valid JSON object, with no other text or markdown.**
    The JSON object must have these exact keys: "script", "storyboard", "music_prompt".
    - "script" should contain "hook", "body", and "cta". All text must be in Indonesian.
    - "storyboard" should be an array of objects, each with "visual_description", "camera_angle", and "script_text". All text must be in Indonesian.
    - "music_prompt" should be a string.

    Creative Brief:
    - Product Category: ${category}
    - Product Link: ${productLink} (Analyze for product details and user testimonials to make the script sound authentic and UGC-style)
    - Target Audience: Age ${targetAge}, Gender ${targetGender}
    - Video Format: ${aspectRatio}
    - Setting: ${setting}
    - Music Style: ${musicStyle}
    - Number of Scenes: Exactly ${frameCount}

    The storyboard must have ${frameCount} scenes.
    - Create a dynamic and engaging sequence. Mix shots featuring the model with the product, and some shots that are close-ups of only the product.
    - For each scene's "camera_angle", choose a UNIQUE angle from this list: ['Full Body', 'Macro Camera', 'High Angle', 'Eye Bird', 'Low Angle', 'Side Profile', 'Over the Shoulder', 'Eye-Level', '¾ Angle', 'Close-up Product', 'POV']. Do not repeat angles.
    - The poses and gestures must be varied in each scene.
  `;
};

interface GeminiResponse {
  script: FullScript;
  storyboard: StoryboardFrame[];
  music_prompt: string;
}

export const generateStoryboardAndScript = async (brief: CreativeBrief, apiKey: string): Promise<GeminiResponse> => {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const model = 'gemini-2.5-pro';
    const prompt = buildStoryboardPrompt(brief);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (!result.script || !result.storyboard || !result.music_prompt) {
      throw new Error("Invalid JSON structure from Gemini API.");
    }

    return result;

  } catch (error) {
    console.error("Error generating storyboard and script:", error);
     if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission'))) {
        throw new Error('API Key tidak valid atau salah. Silakan periksa kembali.');
    }
    throw error;
  }
};

const buildImagePrompt = (frame: StoryboardFrame, brief: CreativeBrief): string => {
    return `
      ATURAN MUTLAK (TIDAK BISA DITAWAR):
      1.  **KONSISTENSI ADALAH #1:** Anda HARUS membuat gambar yang 100% konsisten secara visual dengan gambar referensi yang diberikan. Ini adalah prioritas tertinggi.
      2.  **PAKAIAN MODEL:** JANGAN MENGUBAH pakaian model. Tiru gaya, warna, dan item pakaian dari gambar referensi SECARA PERSIS.
      3.  **PRODUK:** Tiru produk dari gambar referensi SECARA PERSIS. Bentuk, warna, dan ukurannya tidak boleh berubah.
      4.  **TEKS/LOGO PADA PRODUK:** Ini SANGAT PENTING. Tiru teks atau logo pada produk dari gambar referensi seakurat mungkin. Jika replikasi sempurna tidak memungkinkan, buat area teks menjadi sedikit buram atau tidak fokus. JANGAN PERNAH membuat teks yang salah, rusak, atau glitch.

      KONTEKS ADEGAN:
      Ini adalah sebuah frame dari video UGC. Setiap frame harus terlihat seperti bagian dari video yang sama.

      DETAIL ADEGAN UNTUK FRAME INI:
      -   **Visual Description:** ${frame.visual_description}.
      -   **Camera Angle:** ${frame.camera_angle}.
      -   **Setting:** ${brief.setting}.
      -   **Format:** ${brief.aspectRatio}.

      Buat gambar fotorealistik berkualitas tinggi yang mengikuti SEMUA ATURAN di atas dengan sempurna.
    `;
};

export const generateImageForFrame = async (frame: StoryboardFrame, brief: CreativeBrief, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const model = 'gemini-2.5-flash-image';
    const prompt = buildImagePrompt(frame, brief);

    const imageParts = [];
    if (brief.imageUploadMode === 'model_and_product') {
        if (brief.modelImage) {
            imageParts.push({ inlineData: { data: brief.modelImage.base64, mimeType: brief.modelImage.mimeType }});
        }
        if (brief.productImage) {
            imageParts.push({ inlineData: { data: brief.productImage.base64, mimeType: brief.productImage.mimeType }});
        }
    } else {
        if (brief.combinedImage) {
            imageParts.push({ inlineData: { data: brief.combinedImage.base64, mimeType: brief.combinedImage.mimeType }});
        }
    }

    const contents = { parts: [...imageParts, { text: prompt }] };

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (response.promptFeedback?.blockReason) {
        throw new Error(`Pembuatan gambar diblokir. Alasan: ${response.promptFeedback.blockReason}`);
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`AI tidak mengembalikan gambar. Respons: "${textResponse}"`);
    }

    throw new Error('AI tidak mengembalikan gambar.');

  } catch (error) {
     console.error(`Error generating image for frame "${frame.visual_description}":`, error);
     if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission'))) {
        throw new Error('API Key tidak valid atau salah. Silakan periksa kembali.');
    }
    throw error;
  }
};