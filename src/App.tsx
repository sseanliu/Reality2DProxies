import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { AnalysisForm } from './components/AnalysisForm';
import { ResultDisplay } from './components/ResultDisplay';
import { useAnalysis } from './hooks/useAnalysis';
import toast from 'react-hot-toast';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('<universal_twice>');
  const [token, setToken] = useState('');
  
  const { loading, error, results, analyze } = useAnalysis();

  const handleAnalyze = async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }
    if (!token) {
      toast.error('Please enter your API token');
      return;
    }

    await analyze({
      image,
      prompts: [{ type: 'text', text: prompt }]
    }, token);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">DINO-X API Testbed</h1>
          </div>
          <p className="text-gray-600">
            Test the DINO-X API for object detection, segmentation, and more
          </p>
        </header>

        <AnalysisForm
          token={token}
          setToken={setToken}
          prompt={prompt}
          setPrompt={setPrompt}
          image={image}
          setImage={setImage}
          onSubmit={handleAnalyze}
          loading={loading}
        />

        {(results.length > 0 || error) && (
          <ResultDisplay
            objects={results}
            error={error}
            image={image}
          />
        )}
      </div>
    </div>
  );
}

export default App;