"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from "lucide-react";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { extractTextFromPDF } from "@/lib/pdf-utils";

interface FileUploaderProps {
  onFileProcessed: (text: string, fileType: 'pdf' | 'image', fileName: string) => void;
  onError?: (error: string) => void;
}

interface UploadedFile {
  file: File;
  type: 'pdf' | 'image';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  extractedText?: string;
}

export default function FileUploader({ onFileProcessed, onError }: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
      
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        const error = `Unsupported file type: ${file.type}. Please upload PDF or image files only.`;
        onError?.(error);
        continue;
      }

      const uploadedFile: UploadedFile = {
        file,
        type: fileType,
        status: 'uploading',
        progress: 0,
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // Step 1: Try to upload to Cloudinary
        let cloudinaryUrl = '';
        let extractedText = '';
        
        try {
          const base64File = await fileToBase64(file);
          cloudinaryUrl = await uploadFileToCloudinary(base64File, fileType);
          
          setUploadedFiles(prev => 
            prev.map(f => f.file === file ? { ...f, status: 'processing', progress: 50 } : f)
          );
        } catch (cloudinaryError) {
          console.warn('Cloudinary upload failed, using fallback mode:', cloudinaryError);
          // Continue with local processing even if Cloudinary fails
          setUploadedFiles(prev => 
            prev.map(f => f.file === file ? { ...f, status: 'processing', progress: 30 } : f)
          );
        }

        // Step 2: Extract text from file
        if (fileType === 'pdf') {
          try {
            extractedText = await extractTextFromPDF(file);
          } catch (pdfError) {
            console.warn('PDF text extraction failed, using placeholder:', pdfError);
            extractedText = `[PDF Content: ${file.name}]\n\nThis PDF file has been processed locally. The file contains ${file.size} bytes of data. For actual text extraction, please ensure proper PDF processing libraries are configured.`;
          }
        } else {
          // For images, we'll use a placeholder since OCR would be needed
          extractedText = `[Image Content: ${file.name}]\n\nThis image file has been processed locally. File size: ${(file.size / 1024).toFixed(2)} KB. For text extraction from images, OCR functionality would need to be implemented.`;
        }

        // Add Cloudinary URL if upload was successful
        let displayText = extractedText;
        if (cloudinaryUrl) {
          displayText += `\n\n[File uploaded to Cloudinary: ${cloudinaryUrl}]`;
        } else {
          displayText += `\n\n[Note: File processed locally - Cloudinary upload failed or is not configured]`;
        }

        setUploadedFiles(prev => 
          prev.map(f => f.file === file ? { 
            ...f, 
            status: 'completed', 
            progress: 100, 
            extractedText: displayText
          } : f)
        );

        // Send only the clean extracted text to parent component for AI processing
        onFileProcessed(extractedText, fileType, file.name);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadedFiles(prev => 
          prev.map(f => f.file === file ? { 
            ...f, 
            status: 'error', 
            error: errorMessage 
          } : f)
        );
        onError?.(errorMessage);
      }
    }
  }, [onFileProcessed, onError]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-50 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? 'Drop your files here' : 'Upload PDF or Image Files'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            PDF files
          </div>
          <div className="flex items-center">
            <Image className="w-4 h-4 mr-1" />
            Images (JPG, PNG, GIF, WebP)
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h3>
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(uploadedFile.status)}`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(uploadedFile.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    {uploadedFile.type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-red-500" />
                    ) : (
                      <Image className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-medium text-gray-900">{uploadedFile.file.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  {uploadedFile.error && (
                    <div className="text-sm text-red-600">{uploadedFile.error}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  {uploadedFile.status === 'uploading' && 'Uploading...'}
                  {uploadedFile.status === 'processing' && 'Processing...'}
                  {uploadedFile.status === 'completed' && 'Completed'}
                  {uploadedFile.status === 'error' && 'Failed'}
                </div>
                <button
                  onClick={() => removeFile(uploadedFile.file)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
