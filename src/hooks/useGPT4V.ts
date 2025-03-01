import { useState } from 'react';
import { analyzeImageWithGPT4V, GPT4VError } from '../services/gpt4v';
import { GPT4VResponse } from '../types/gpt4v';
import toast from 'react-hot-toast';

interface GPT4VState {
  loading: boolean;
  error: string;
  result: GPT4VResponse | null;
}

export const useGPT4V = () => {
  const [state, setState] = useState<GPT4VState>({
    loading: false,
    error: '',
    result: null
  });

  const analyze = async (image: string, apiKey: string, prompt: string = 'explain this') => {
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await analyzeImageWithGPT4V(image, prompt, apiKey);
      setState({
        loading: false,
        error: '',
        result: response
      });
      toast.success('GPT-4V analysis complete!');
    } catch (err) {
      const errorMessage = err instanceof GPT4VError ? err.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  return {
    ...state,
    analyze
  };
};