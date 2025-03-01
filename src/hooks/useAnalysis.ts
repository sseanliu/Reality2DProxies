import { useState } from 'react';
import { analyzeDinox, ApiError } from '../services/api';
import { DetectedObject, DinoxRequest } from '../types/api';
import toast from 'react-hot-toast';

interface AnalysisState {
  loading: boolean;
  error: string;
  results: DetectedObject[];
}

export const useAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: '',
    results: []
  });

  const analyze = async (request: DinoxRequest, token: string) => {
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await analyzeDinox(request, token);
      
      // Log simplified object information
      console.log('DINO-X API Response:', response);
      console.log('Detected Objects:', response.data.result.objects.map(obj => ({
        category: obj.category,
        bbox: obj.bbox
      })));

      // Log unique categories
      const categories = [...new Set(response.data.result.objects.map(obj => obj.category))].sort();
      console.log('Categories:', categories);
      
      setState({
        loading: false,
        error: '',
        results: response.data.result.objects
      });
      toast.success('Analysis complete!');
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
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