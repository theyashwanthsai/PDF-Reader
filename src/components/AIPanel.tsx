import React, { useState } from 'react';
import { Send, Loader2, X, Copy, CheckCheck, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { AIResponse } from '../types';

interface AIPanelProps {
  selectedText: string;
  aiResponse: AIResponse;
  onAskAI: (text: string, question?: string) => void;
  onClear: () => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ selectedText, aiResponse, onAskAI, onClear }) => {
  const [question, setQuestion] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedText.trim() !== '') {
      onAskAI(selectedText, question);
      setQuestion('');
    }
  };

  const handleExplainSelection = () => {
    if (selectedText.trim() !== '') {
      onAskAI(selectedText, 'Explain this text in simple terms');
      setQuestion('');
    }
  };

  const handleSummarizeSelection = () => {
    if (selectedText.trim() !== '') {
      onAskAI(selectedText, 'Summarize this text in a few bullet points');
      setQuestion('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponse.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--ds-background-200)' }}>
      <div className="flex justify-between items-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center">
          <Sparkles size={18} className="mr-2 text-accent-400" />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>AI Assistant</h2>
        </div>
        <button 
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-dark-700 transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          aria-label="Clear"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedText ? (
          <div className="p-4 rounded-lg shadow-inner-light" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className="text-sm font-medium mb-2 flex items-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <MessageSquare size={14} className="mr-1.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              Selected Text:
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{selectedText}</p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleExplainSelection}
                className="px-3 py-1.5 text-xs rounded-md transition-colors"
                style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa' }}
              >
                Explain
              </button>
              <button
                onClick={handleSummarizeSelection}
                className="px-3 py-1.5 text-xs rounded-md transition-colors"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Summarize
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            <div className="p-5 rounded-lg text-center max-w-xs" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <MessageSquare size={24} className="mx-auto mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
              <p>Select text from the PDF to ask questions</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Highlight text with your cursor</p>
            </div>
          </div>
        )}

        {aiResponse.content && (
          <div className="relative p-5 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="absolute top-3 right-3">
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-full hover:bg-dark-700 transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                aria-label="Copy to clipboard"
              >
                {copied ? <CheckCheck size={16} className="text-accent-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center mr-2">
                <Sparkles size={12} className="text-white" />
              </div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>AI Response</p>
            </div>
            <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--ds-gray-1000)' }}>{aiResponse.content}</p>
          </div>
        )}

        {aiResponse.isLoading && (
          <div className="flex justify-center items-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-accent-500 mb-3" size={24} />
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Analyzing text...</span>
            </div>
          </div>
        )}

        {aiResponse.error && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#f87171' }}>
            <p className="text-sm flex items-center">
              <X size={16} className="mr-2" />
              Error: {aiResponse.error}
            </p>
            <button
              onClick={() => onAskAI(selectedText, question || 'Explain this')}
              className="mt-2 text-xs flex items-center"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              <RefreshCw size={12} className="mr-1" /> Try again
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the selected text..."
            className="flex-1 p-2.5 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent-600/50"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: 'var(--ds-gray-1000)',
              borderRight: 'none'
            }}
            disabled={!selectedText || aiResponse.isLoading}
          />
          <button
            type="submit"
            className="p-2.5 bg-accent-600 text-white rounded-r-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-600/50 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            style={{ 
              backgroundColor: !selectedText || aiResponse.isLoading || question.trim() === '' ? 'rgba(37, 99, 235, 0.3)' : '#2563eb',
              color: !selectedText || aiResponse.isLoading || question.trim() === '' ? 'rgba(255, 255, 255, 0.5)' : 'white'
            }}
            disabled={!selectedText || aiResponse.isLoading || question.trim() === ''}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            {selectedText ? 'Ask anything about the selected text' : 'Select text first to ask questions'}
          </p>
        </div>
      </form>
    </div>
  );
};

export default AIPanel;