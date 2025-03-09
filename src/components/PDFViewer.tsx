import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Upload, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, ArrowUp } from 'lucide-react';
import { PDFDocument } from '../types';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  document: PDFDocument;
  onTextSelection: (text: string) => void;
  onFileChange: (document: PDFDocument) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ document, onTextSelection, onFileChange }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [pagesRendered, setPagesRendered] = useState<number[]>([1]);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    pageRefs.current = Array(numPages).fill(null);
    
    // Initialize with first few pages
    const initialPages = Array.from({ length: Math.min(3, numPages) }, (_, i) => i + 1);
    setPagesRendered(initialPages);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange({
        file,
        url: URL.createObjectURL(file),
        name: file.name
      });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      onTextSelection(selection.toString());
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
      scrollToPage(currentPage + 1);
    }
  };

  const scrollToPage = (pageNumber: number) => {
    if (pageRefs.current[pageNumber - 1]) {
      pageRefs.current[pageNumber - 1]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation((rotation + 90) % 360);
  };

  // Handle scroll to detect current page and show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !numPages) return;
      
      // Show/hide scroll to top button
      setShowScrollTop(containerRef.current.scrollTop > 300);
      
      // Find current page based on scroll position
      const containerTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;
      const containerCenter = containerTop + containerHeight / 2;
      
      let closestPage = 1;
      let closestDistance = Infinity;
      
      pageRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const refCenter = rect.top + rect.height / 2;
          const distance = Math.abs(refCenter - containerHeight / 2);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestPage = index + 1;
          }
        }
      });
      
      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
      
      // Dynamically load more pages as user scrolls
      if (numPages) {
        const visibleStart = Math.max(1, closestPage - 2);
        const visibleEnd = Math.min(numPages, closestPage + 4);
        
        const newPagesToRender = Array.from(
          { length: visibleEnd - visibleStart + 1 },
          (_, i) => visibleStart + i
        );
        
        setPagesRendered(prev => {
          const combined = [...new Set([...prev, ...newPagesToRender])];
          return combined.sort((a, b) => a - b);
        });
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, numPages]);

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50' : 'h-full'}`} style={{ backgroundColor: 'var(--ds-background-200)' }}>
      <div className="flex justify-between items-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center space-x-3">
          <label className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors cursor-pointer shadow-md">
            <Upload size={16} className="mr-2" />
            Open PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {document.name && (
            <span className="text-sm font-medium truncate max-w-xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {document.name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={zoomOut}
            className="p-2 rounded-md hover:bg-dark-700 transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm px-2 py-1 rounded-md min-w-[60px] text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-md hover:bg-dark-700 transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={rotate}
            className="p-2 rounded-md hover:bg-dark-700 transition-colors ml-1"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Rotate"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-dark-700 transition-colors ml-1"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin"
        style={{ 
          backgroundColor: 'var(--ds-background-200)',
          scrollBehavior: 'smooth'
        }}
        onMouseUp={handleTextSelection}
      >
        {document.url ? (
          <div className="flex flex-col items-center py-8">
            <Document
              file={document.url}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center"
            >
              {numPages && Array.from(new Array(numPages)).map((_, index) => {
                const pageNumber = index + 1;
                // Only render pages that are in the pagesRendered array
                return pagesRendered.includes(pageNumber) ? (
                  <div 
                    key={`page_${pageNumber}`}
                    ref={el => pageRefs.current[index] = el}
                    className="mb-8 relative"
                  >
                    <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-accent-600/80 text-white text-xs py-1 px-2 rounded-l-md">
                      {pageNumber}
                    </div>
                    <Page
                      key={`page_${pageNumber}_${scale}_${rotation}`}
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="shadow-xl bg-white rounded-md overflow-hidden transition-shadow hover:shadow-2xl"
                      loading={
                        <div className="flex justify-center items-center h-[600px] w-[450px] bg-dark-800/20 rounded-md animate-pulse">
                          <div className="text-accent-400">Loading page {pageNumber}...</div>
                        </div>
                      }
                    />
                  </div>
                ) : null;
              })}
            </Document>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Upload size={48} className="mb-4 mx-auto text-accent-500" />
              <p className="text-center">Upload a PDF to get started</p>
              <p className="text-center text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                Select text to analyze with AI
              </p>
            </div>
          </div>
        )}
      </div>

      {document.url && numPages && (
        <div className="flex justify-between items-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`p-2 rounded-md transition-colors`}
            style={{ color: currentPage <= 1 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="text-sm px-3 py-1 rounded-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{numPages}</span>
          </p>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= (numPages || 1)}
            className={`p-2 rounded-md transition-colors`}
            style={{ color: currentPage >= (numPages || 1) ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-accent-600 text-white shadow-lg hover:bg-accent-700 transition-all transform hover:scale-105 z-10"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default PDFViewer;