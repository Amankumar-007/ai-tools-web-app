'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadBox from './components/UploadBox';
import ImagePreview from './components/ImagePreview';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import ErrorCard from './components/ErrorCard';
import { AlertCircle } from 'lucide-react';

export interface AnalysisResult {
  imageUrl: string;
  caption: string;
  isFood: boolean;
  foodItems?: string[];
  calories?: number;
  nutrition?: {
    carbs: number;
    protein: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  recipe?: {
    name: string;
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    cookTime: string;
    servings: number;
  };
  healthScore?: number;
  dietaryInfo?: string[];
}

export default function FoodAnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Convert image to base64
      const base64 = await convertToBase64(selectedFile);
      
      // Create FormData for better handling
      const formData = new FormData();
      formData.append('image', base64);
      formData.append('fileName', selectedFile.name);
      formData.append('fileType', selectedFile.type);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the improved API route
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resetAnalyzer = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-800 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            AI Food <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Analyzer</span>
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Upload any food image to instantly get nutritional insights, calorie counts, and personalized recipes
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Upload Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!selectedImage ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <UploadBox onImageSelect={handleImageSelect} />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImagePreview 
                    imageUrl={selectedImage}
                    onAnalyze={analyzeImage}
                    onReset={resetAnalyzer}
                    isAnalyzing={isAnalyzing}
                    uploadProgress={uploadProgress}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Tips */}
            {!selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 border border-orange-200"
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Pro Tips for Best Results
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use clear, well-lit images for accurate analysis</li>
                  <li>• Center the food item in the frame</li>
                  <li>• Avoid heavily filtered or edited images</li>
                  <li>• Single dish photos work better than buffets</li>
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right Column - Results Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isAnalyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingState progress={uploadProgress} />
                </motion.div>
              )}

              {result && !isAnalyzing && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResultCard result={result} />
                </motion.div>
              )}

              {error && !isAnalyzing && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ErrorCard error={error} onRetry={resetAnalyzer} />
                </motion.div>
              )}

              {!result && !error && !isAnalyzing && selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-32 h-32 mx-auto mb-6 text-orange-200">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <p className="text-gray-500">Click "Analyze Image" to start</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}