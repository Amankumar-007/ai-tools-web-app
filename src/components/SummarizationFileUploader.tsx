import React, { useState, useRef } from 'react';

interface SummarizationFileUploaderProps {
  onFileProcessed: (text: string, fileType: 'pdf' | 'text', fileName: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const SummarizationFileUploader: React.FC<SummarizationFileUploaderProps> = ({ 
  onFileProcessed, 
  onError, 
  disabled 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = (typeof window !== 'undefined')
      ? `${window.location.origin}/pdf.worker.min.mjs`
      : '/pdf.worker.min.mjs';

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items
        .map((item: any) => item.str)
        .join(' ') + '\n';
    }

    return text.trim();
  };

  const extractTextFromTextFile = async (file: File): Promise<string> => {
    return await file.text();
  };

  const processFile = async (file: File) => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    try {
      let text: string;
      let fileType: 'pdf' | 'text';

      if (file.type === 'application/pdf') {
        fileType = 'pdf';
        text = await extractTextFromPdf(file);
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        fileType = 'text';
        text = await extractTextFromTextFile(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or text files.');
      }

      if (!text || text.length < 10) {
        throw new Error('Could not extract enough text from the file. It might be empty or corrupted.');
      }

      onFileProcessed(text, fileType, file.name);
    } catch (error: any) {
      onError(error.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      processFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 text-center ${
        isDragging
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
          : 'border-slate-300 hover:border-orange-400 bg-white dark:bg-slate-900/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.txt,text/*"
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isProcessing 
            ? 'bg-orange-100 dark:bg-orange-900/30' 
            : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          {isProcessing ? (
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          {isProcessing ? 'Processing File...' : 'Upload Document for Summarization'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
          {isProcessing 
            ? 'Extracting text from your file...'
            : 'Drag and drop PDF or text files here, or click to browse files.'
          }
        </p>
        <button
          disabled={disabled || isProcessing}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-orange-200/50"
        >
          {isProcessing ? 'Processing...' : 'Select Files'}
        </button>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          Supported formats: PDF, TXT, and other text files
        </p>
      </div>
    </div>
  );
};

export default SummarizationFileUploader;
