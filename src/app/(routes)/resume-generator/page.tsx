'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

import { 
  Trash2, 
  Plus, 
  Download, 
  Eye, 
  Loader2, 
  FileText, 
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Star,
  Save,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
}

interface Experience {
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa: string;
}

interface AdditionalSection {
  title: string;
  content: string;
}

// Simple Switch Component
const Switch = ({ checked, onCheckedChange, disabled = false, id }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        checked ? 'bg-orange-500' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// PDF Download Function
const downloadAsPDF = async (html: string, filename?: string) => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Please allow popups to download PDF');
    }
    
    // Set a meaningful title so some browsers use it as a suggested filename
    if (filename) {
      try { printWindow.document.title = filename; } catch {}
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    await new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      printWindow.onload = resolve as any;
      setTimeout(resolve, 1000);
    });
    
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
    return true;
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
};

// HTML Download Function
const downloadAsHTML = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function ResumeGenerator() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: ''
  });

  const [experience, setExperience] = useState<Experience[]>([
    { position: '', company: '', duration: '', description: '' }
  ]);

  const [education, setEducation] = useState<Education[]>([
    { degree: '', institution: '', year: '', gpa: '' }
  ]);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [additionalSections, setAdditionalSections] = useState<AdditionalSection[]>([]);
  
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Experience functions
  const addExperience = () => {
    setExperience([...experience, { position: '', company: '', duration: '', description: '' }]);
  };
  const removeExperience = (index: number) => {
    if (experience.length > 1) setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  // Education functions
  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', year: '', gpa: '' }]);
  };
  const removeEducation = (index: number) => {
    if (education.length > 1) setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  // Skills functions
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };
  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Additional sections functions
  const addAdditionalSection = () => {
    setAdditionalSections([...additionalSections, { title: '', content: '' }]);
  };
  const removeAdditionalSection = (index: number) => {
    setAdditionalSections(additionalSections.filter((_, i) => i !== index));
  };
  const updateAdditionalSection = (index: number, field: keyof AdditionalSection, value: string) => {
    const updated = [...additionalSections];
    updated[index][field] = value;
    setAdditionalSections(updated);
  };

  // Generate resume function
  const generateResume = async () => {
    if (!personalInfo.fullName.trim()) {
      showNotification('error', 'Please enter your full name');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo,
          experience: experience.filter(exp => exp.position.trim() || exp.company.trim()),
          education: education.filter(edu => edu.degree.trim() || edu.institution.trim()),
          skills,
          additionalSections: additionalSections.filter(section => section.title.trim()),
          useAI
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedHTML(data.html);
        setShowPreview(true);
        setCurrentStep(5);
        showNotification('success', 'Resume generated successfully!');
        if (data.fallback) {
          showNotification('info', 'Generated using local template due to AI service unavailability');
        }
      } else {
        showNotification('error', 'Failed to generate resume: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'An error occurred while generating the resume');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download functions
  const handleDownloadPDF = async () => {
    if (!generatedHTML) return;
    try {
      await downloadAsPDF(generatedHTML, personalInfo.fullName.replace(/\s+/g, '_') + '_Resume');
      showNotification('success', 'Resume saved as PDF!');
    } catch {
      showNotification('error', 'Unable to generate PDF. Please ensure popups are allowed.');
    }
  };
  const handleDownloadHTML = () => {
    if (!generatedHTML) return;
    downloadAsHTML(generatedHTML, personalInfo.fullName.replace(/\s+/g, '_') + '_Resume');
    showNotification('success', 'Resume downloaded as HTML!');
  };

  // Steps
  const steps = [
    { number: 1, title: 'Personal Info', icon: User, description: 'Basic information' },
    { number: 2, title: 'Experience', icon: Briefcase, description: 'Work history' },
    { number: 3, title: 'Education', icon: GraduationCap, description: 'Academic background' },
    { number: 4, title: 'Skills & More', icon: Code, description: 'Skills & additional sections' },
    { number: 5, title: 'Generate', icon: Sparkles, description: 'Create resume' }
  ];

  const goToStep = (n: number) => setCurrentStep(Math.min(5, Math.max(1, n)));

  // Auto-save
  useEffect(() => {
    const saveData = {
      personalInfo,
      experience,
      education,
      skills,
      additionalSections,
      useAI,
      currentStep
    };
    localStorage.setItem('resumeData', JSON.stringify(saveData));
  }, [personalInfo, experience, education, skills, additionalSections, useAI, currentStep]);

  // Load saved
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setPersonalInfo(data.personalInfo || personalInfo);
        setExperience(data.experience || experience);
        setEducation(data.education || education);
        setSkills(data.skills || []);
        setAdditionalSections(data.additionalSections || []);
        setUseAI(data.useAI ?? true);
        setCurrentStep(data.currentStep || 1);
      } catch (error) {
        console.log('Error loading saved data:', error);
      }
    }
  }, []);

  // Render steps
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                  className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  placeholder="john@example.com"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                  className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                  className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                  className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="portfolio" className="text-sm font-medium text-gray-700">Portfolio</Label>
                <Input
                  id="portfolio"
                  placeholder="https://johndoe.dev"
                  value={personalInfo.portfolio}
                  onChange={(e) => setPersonalInfo({...personalInfo, portfolio: e.target.value})}
                  className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                Professional Summary {!useAI && '*'}
              </Label>
              <Textarea
                id="summary"
                placeholder={useAI ? "AI will generate if empty..." : "Write a compelling professional summary..."}
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <div>
                  <Label htmlFor="ai-toggle" className="text-sm font-medium text-gray-900">
                    AI Enhancement
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">Use AI to improve content and formatting</p>
                </div>
              </div>
              <Switch checked={useAI} onCheckedChange={setUseAI} id="ai-toggle" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => goToStep(2)}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Next: Add Experience
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentStep === 2) {
      return (
        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Experience
            </CardTitle>
            <Button onClick={addExperience} size="sm" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {experience.map((exp, index) => (
              <div key={index} className="p-5 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Experience {index + 1}
                  </h4>
                  {experience.length > 1 && (
                    <Button
                      onClick={() => removeExperience(index)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Position</Label>
                    <Input
                      placeholder="Software Engineer"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Company</Label>
                    <Input
                      placeholder="Tech Company Inc."
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Duration</Label>
                  <Input
                    placeholder="Jan 2020 - Present"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    placeholder={useAI ? "Brief description (AI will enhance)..." : "Detailed job responsibilities and achievements..."}
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => goToStep(1)}
                variant="outline"
                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Previous
              </Button>
              <Button 
                onClick={() => goToStep(3)}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Next: Add Education
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentStep === 3) {
      return (
        <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
            <Button onClick={addEducation} size="sm" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="p-5 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education {index + 1}
                  </h4>
                  {education.length > 1 && (
                    <Button
                      onClick={() => removeEducation(index)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Degree</Label>
                    <Input
                      placeholder="Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Institution</Label>
                    <Input
                      placeholder="University Name"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Year</Label>
                    <Input
                      placeholder="2020"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">GPA (optional)</Label>
                    <Input
                      placeholder="3.8"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => goToStep(2)}
                variant="outline"
                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Previous
              </Button>
              <Button 
                onClick={() => goToStep(4)}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Next: Add Skills
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentStep === 4) {
      return (
        <>
          {/* Skills */}
          <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., JavaScript, Project Management)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <Button onClick={addSkill} className="bg-orange-500 hover:bg-orange-600 px-6">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    className="px-3 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer transition-colors"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill}
                    <Trash2 className="w-3 h-3 ml-2 inline" />
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No skills added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow mt-6">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Additional Sections
              </CardTitle>
              <Button 
                onClick={addAdditionalSection} 
                size="sm" 
                variant="secondary" 
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {additionalSections.map((section, index) => (
                <div key={index} className="p-5 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-orange-700">Section {index + 1}</h4>
                    <Button
                      onClick={() => removeAdditionalSection(index)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Section Title</Label>
                    <Input
                      placeholder="e.g., Certifications, Awards, Projects"
                      value={section.title}
                      onChange={(e) => updateAdditionalSection(index, 'title', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Content</Label>
                    <Textarea
                      placeholder="Add content for this section..."
                      value={section.content}
                      onChange={(e) => updateAdditionalSection(index, 'content', e.target.value)}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              {additionalSections.length === 0 && (
                <p className="text-gray-500 text-center py-8 italic">
                  No additional sections added. Click &quot;Add Section&quot; to include certifications, awards, projects, etc.
                </p>
              )}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => goToStep(3)}
                  variant="outline"
                  className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Previous
                </Button>
                <Button 
                  onClick={() => goToStep(5)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Next: Generate Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    // Step 5 (Generate)
    return (
      <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Resume
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-gray-600">
            Review your details and click Generate. You can still go back and edit any section.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => goToStep(4)}
              variant="outline"
              className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              Previous
            </Button>
            <Button
              onClick={generateResume}
              disabled={isGenerating || !personalInfo.fullName.trim()}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Resume
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Resume Generator</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Create professional, ATS-friendly resumes in minutes with AI assistance
            </p>
            
            {/* Progress Steps */}
            <div className="flex justify-center mt-8 overflow-x-auto">
              <div className="flex items-center space-x-4 bg-orange-50 p-4 rounded-full min-w-max">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  
                  return (
                    <div key={step.number} className="flex items-center">
                      <div 
                        className={`flex flex-col items-center cursor-pointer transition-all ${
                          isActive ? 'scale-110' : ''
                        }`}
                        onClick={() => goToStep(step.number)}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                          isActive ? 'bg-orange-500 text-white shadow-lg' : 
                          isCompleted ? 'bg-green-500 text-white' : 
                          'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs mt-1 font-medium ${
                          isActive ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-6">
            {renderStepContent()}
          </div>

            {/* Right: Actions + Tips */}
          <div className="lg:col-span-1 space-y-6">
            {/* Generate/Actions */}
            <Card className="border-orange-200 shadow-lg sticky top-6">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={() => goToStep(5)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
                >
                  Go to Generate
                </Button>

                {generatedHTML && (
                  <>
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="w-5 h-5 mr-2" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Show Preview
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        onClick={handleDownloadHTML}
                        variant="outline"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        HTML
                      </Button>
                    </div>
                  </>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-orange-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        localStorage.removeItem('resumeData');
                        window.location.reload();
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                    <Button
                      onClick={() => {
                        const saveData = {
                          personalInfo,
                          experience,
                          education,
                          skills,
                          additionalSections,
                          useAI,
                          currentStep
                        };
                        localStorage.setItem('resumeData', JSON.stringify(saveData));
                        showNotification('success', 'Data saved to browser storage');
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="w-5 h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Use action verbs in your experience descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Include quantifiable achievements when possible</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Keep your resume to 1-2 pages maximum</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Tailor your resume for each job application</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>AI enhancement improves keyword optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && generatedHTML && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Resume Preview
                </h3>
                <Button
                  onClick={() => setShowPreview(false)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div 
                  className="resume-preview bg-white"
                  dangerouslySetInnerHTML={{ __html: generatedHTML }}
                />
              </div>
              <div className="bg-gray-50 p-4 flex justify-end gap-2 border-t">
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleDownloadHTML}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download HTML
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom styles for resume preview */}
      <style jsx global>{`
        .resume-preview {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .resume-preview h1 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .resume-preview h2 {
          color: #34495e;
          margin-top: 20px;
          margin-bottom: 10px;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 5px;
        }
        .resume-preview ul {
          padding-left: 20px;
        }
        .resume-preview li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}