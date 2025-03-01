import React from 'react';
import { ImageUploader } from './ImageUploader';

interface AnalysisFormProps {
  token: string;
  setToken: (token: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  image: string | null;
  setImage: (image: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  token,
  setToken,
  prompt,
  setPrompt,
  image,
  setImage,
  onSubmit,
  loading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your API token"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Prompt
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter prompt or use <universal_twice>"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </label>
        <ImageUploader onImageSelect={setImage} />
        {image && (
          <div className="mt-4">
            <img
              src={image}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium
          ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>
    </div>
  );
};