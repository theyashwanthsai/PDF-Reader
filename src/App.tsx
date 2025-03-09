import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import AIPanel from './components/AIPanel';
import { getAIResponse } from './services/aiService';
import { AIResponse, PDFDocument } from './types';
import { FileText, Brain, Github } from 'lucide-react';

function App() {
  const [selectedText, setSelectedText] = useState<string>('');
  const [aiResponse, setAIResponse] = useState<AIResponse>({
    content: '',
    isLoading: false,
    error: null
  });
  const [pdfDocument, setPdfDocument] = useState<PDFDocument>({
    file: null,
    url: null,
    name: ''
  });

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
  };

  const handleFileChange = (document: PDFDocument) => {
    setPdfDocument(document);
  };

  const handleAskAI = async (text: string, question?: string) => {
    setAIResponse({
      content: '',
      isLoading: true,
      error: null
    });

    try {
      const response = await getAIResponse(text, question);
      setAIResponse({
        content: response,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAIResponse({
        content: '',
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  const handleClear = () => {
    setSelectedText('');
    setAIResponse({
      content: '',
      isLoading: false,
      error: null
    });
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--ds-background-200)', color: 'var(--ds-gray-1000)' }}>
      <header className="flex items-center justify-between px-6 py-3 shadow-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center">
          <div className="bg-accent-600 p-2 rounded-lg mr-3">
            <FileText size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            PDF Reader AI Demo 
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:text-white transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <Github size={18} className="mr-1" />
            <span className="text-sm">GitHub</span>
          </a> */}
          {/* <div className="flex items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Brain size={16} className="mr-2 text-accent-400" />
            <span className="text-sm font-medium">AI Powered</span>
          </div> */}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <PDFViewer 
            document={pdfDocument}
            onTextSelection={handleTextSelection}
            onFileChange={handleFileChange}
          />
        </div>
        <div className="w-1/3 min-w-[350px] max-w-[450px]" style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <AIPanel 
            selectedText={selectedText}
            aiResponse={aiResponse}
            onAskAI={handleAskAI}
            onClear={handleClear}
          />
        </div>
      </main>
    </div>
  );
}

export default App;