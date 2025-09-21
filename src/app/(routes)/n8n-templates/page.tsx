"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, ExternalLink, Play, Check, Search } from "lucide-react";
import { getAllTemplates, ParsedTemplate } from "@/lib/n8n-templates";


const categories = [
  "All",
  "AI Agents",
  "Marketing",
  "Content Creation",
  "Web Scraping",
  "Email Automation",
  "Social Media",
  "Video Production",
  "Business Automation"
];

export default function N8nTemplatesPage() {
  const [templates, setTemplates] = useState<ParsedTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ParsedTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateData = await getAllTemplates();
        setTemplates(templateData);
        setFilteredTemplates(templateData);
      } catch (error) {
        console.error('Error loading templates:', error);
        alert('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(template => 
        template.category === selectedCategory || 
        template.tags.includes(selectedCategory)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredTemplates(filtered);
  }, [selectedCategory, searchQuery, templates]);

  const handleCopyTemplate = async (template: ParsedTemplate) => {
    try {
      // Use the actual JSON content from the template
      const content = template.content;
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(template.id);
      alert('Template copied to clipboard!');
      
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (error) {
      console.error('Error copying template:', error);
      alert('Failed to copy template');
    }
  };

  const handleDownloadTemplate = (template: ParsedTemplate) => {
    // Use the actual JSON content from the template
    const content = template.content;
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Template downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              n8n AI Automation Templates
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional n8n workflows, templates, and AI agents created by The Recap AI community. 
              Automate your business with cutting-edge AI workflows.
            </p>
          </motion.div>

          {/* How to Use Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-8">How to Use n8n Templates</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle className="text-lg">Choose Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse through our collection of AI automation templates and find the one that fits your needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <CardTitle className="text-lg">Copy & Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Click the copy button to copy the template JSON, then import it into your n8n workspace.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle className="text-lg">Configure & Run</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Set up your API keys and configuration, then activate the workflow to start automating.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Category Filter */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCopyTemplate(template)}
                        className="flex-1"
                      >
                        {copiedTemplate === template.id ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copiedTemplate === template.id ? "Copied!" : "Copy"}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadTemplate(template)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      {template.videoUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(template.videoUrl, '_blank')}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
