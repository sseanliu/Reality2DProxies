import OpenAI from 'openai';
import { GPT4VResponse } from '../types/gpt4v';

export class GPT4VError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GPT4VError';
  }
}

export const analyzeImageWithGPT4V = async (
  image: string,
  prompt: string = 'explain this',
  apiKey: string
): Promise<GPT4VResponse> => {
  try {
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Enable browser usage
    });
    
    // Remove data:image/[type];base64, prefix
    const base64Image = image.split(',')[1];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Updated to correct model name
      max_tokens: 500, // Limit response length
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ],
        },
      ],
    });

    return {
      explanation: response.choices[0]?.message?.content || 'No explanation provided',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new GPT4VError(error.message);
    }
    throw new GPT4VError('An unexpected error occurred');
  }
};