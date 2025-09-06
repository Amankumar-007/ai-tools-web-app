import { useEffect, useState } from 'react';

interface ErrorInfo {
  type: 'syntax' | 'runtime' | 'react' | 'tailwind';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export function useErrorDetection(code: string) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!code) return;

    setIsAnalyzing(true);
    const detectedErrors: ErrorInfo[] = [];

    // Check for common React errors
    if (!code.includes('export default')) {
      detectedErrors.push({
        type: 'react',
        message: 'Component must have export default',
        suggestion: 'Add "export default" before your function declaration'
      });
    }

    if (code.includes('useState') && !code.includes('React.useState')) {
      detectedErrors.push({
        type: 'react',
        message: 'useState hook used without React prefix',
        suggestion: 'Use React.useState or add useState to imports'
      });
    }

    if (code.includes('useEffect') && !code.includes('React.useEffect')) {
      detectedErrors.push({
        type: 'react',
        message: 'useEffect hook used without React prefix',
        suggestion: 'Use React.useEffect or add useEffect to imports'
      });
    }

    // Check for syntax errors
    const unclosedTags = code.match(/<(\w+)(?:[^>]*[^/])?>(?![^<]*<\/\1>)/g);
    if (unclosedTags) {
      detectedErrors.push({
        type: 'syntax',
        message: 'Unclosed JSX tags detected',
        suggestion: 'Make sure all JSX tags are properly closed'
      });
    }

    // Check for missing return statement
    if (!code.includes('return')) {
      detectedErrors.push({
        type: 'react',
        message: 'Component missing return statement',
        suggestion: 'Add a return statement to your component'
      });
    }

    // Check for invalid Tailwind classes (basic check)
    const invalidClasses = code.match(/className="[^"]*[A-Z][^"]*"/g);
    if (invalidClasses) {
      detectedErrors.push({
        type: 'tailwind',
        message: 'Potential invalid Tailwind classes (contains uppercase)',
        suggestion: 'Tailwind classes should be lowercase with hyphens'
      });
    }

    setErrors(detectedErrors);
    setIsAnalyzing(false);
  }, [code]);

  return { errors, isAnalyzing };
}
