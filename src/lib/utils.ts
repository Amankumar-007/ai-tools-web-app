// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date helper
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric'
  }).format(d);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }
};

// Resume specific utilities
export const resumeUtils = {
  // Format phone number
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },

  // Format LinkedIn URL
  formatLinkedIn: (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('linkedin.com')) return `https://${url}`;
    if (url.startsWith('www.')) return `https://${url}`;
    return `https://linkedin.com/in/${url}`;
  },

  // Format portfolio URL
  formatPortfolio: (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  },

  // Validate resume data
  validateResumeData: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.personalInfo?.fullName?.trim()) {
      errors.push('Full name is required');
    }
    
    if (data.personalInfo?.email && !isValidEmail(data.personalInfo.email)) {
      errors.push('Invalid email format');
    }
    
    if (data.personalInfo?.linkedin && !isValidUrl(resumeUtils.formatLinkedIn(data.personalInfo.linkedin))) {
      errors.push('Invalid LinkedIn URL');
    }
    
    if (data.personalInfo?.portfolio && !isValidUrl(resumeUtils.formatPortfolio(data.personalInfo.portfolio))) {
      errors.push('Invalid portfolio URL');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate filename for resume
  generateFilename: (fullName: string, format: 'pdf' | 'html' = 'pdf'): string => {
    const sanitized = fullName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    return `${sanitized}_Resume_${date}.${format}`;
  },

  // Parse bullet points from description
  parseBulletPoints: (text: string): string[] => {
    if (!text) return [];
    return text
      .split(/[\n•\-]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  },

  // Format description with bullet points
  formatDescription: (text: string): string => {
    const points = resumeUtils.parseBulletPoints(text);
    if (points.length === 0) return text;
    return points.map(point => `• ${point}`).join('\n');
  }
};

// Export all utilities
export default {
  cn,
  formatDate,
  isValidEmail,
  isValidUrl,
  sanitizeHtml,
  generateId,
  debounce,
  throttle,
  storage,
  resumeUtils
};