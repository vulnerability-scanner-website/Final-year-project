import React, { useState, useEffect } from 'react';
import { FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateProfessionalPDF } from '@/utils/pdfGenerator';

// --- Helper Components ---

// Animated Grid Background
const GridBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-[-10%] animate-grid-pan"
          style={{
              backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)',
          }}></div>
        <style>
        {`
            @keyframes grid-pan {
                0% { transform: translate(0, 0); }
                100% { transform: translate(24px, 24px); }
            }
            .animate-grid-pan {
                animation: grid-pan 10s linear infinite;
            }
        `}
        </style>
    </div>
);

// Icon for PDF files
const FileIcon = () => {
  return (
    <div className="relative flex-shrink-0 w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-4 h-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
      <FileText className="h-6 w-6 text-white" />
    </div>
  );
};

// Progress bar for downloading items
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
  </div>
);

// Action buttons (Download/Cancel)
const ActionButton = ({ file, onDownload }) => {
  return (
    <button 
      onClick={() => onDownload(file)}
      className="flex items-center text-yellow-400 font-semibold text-sm hover:text-yellow-300 transition-colors duration-200"
    >
      <Download className="h-4 w-4 mr-1" />
      Download
    </button>
  );
};

// --- Main File Item Component ---
const FileItem = ({ file, onDownload }) => {
  const { name, subtype, size, status, progress } = file;
  const displaySize = size < 1 ? `${(size * 1000).toFixed(0)} KB` : `${size} MB`;

  return (
    <div className="flex flex-wrap items-center py-3">
      <div className="flex items-center flex-grow min-w-0">
        <FileIcon />
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-white truncate">{name}</p>
          {status === 'downloading' ? (
            <ProgressBar progress={progress} />
          ) : (
            <p className="text-sm text-white/40">{subtype}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end w-full sm:w-auto mt-2 sm:mt-0 pl-[72px] sm:pl-0">
        <div className="flex-shrink-0 w-20 text-right text-sm font-medium text-white/40">
          {displaySize}
        </div>
        <div className="flex-shrink-0 w-24 text-right">
          <ActionButton file={file} onDownload={onDownload} />
        </div>
      </div>
    </div>
  );
};

// --- App Component ---
export default function ReportsDownload() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/scans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const formattedData = data.map((scan) => ({
          id: scan.id,
          name: `${scan.target} - ${new Date(scan.created_at).toLocaleDateString()}.pdf`,
          type: scan.status === 'Completed' ? 'Completed' : 'Processing',
          size: (Math.random() * 5 + 1).toFixed(1),
          status: 'complete',
          subtype: `${scan.issues} vulnerabilities found`,
          progress: 100,
          originalSubtype: `${scan.issues} vulnerabilities found`,
          scanId: scan.id,
          target: scan.target,
          created_at: scan.created_at
        }));
        setFiles(formattedData);
        setFilteredFiles(formattedData);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setFiles([]);
        setFilteredFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter files based on search and type
  useEffect(() => {
    let filtered = files;
    
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.subtype.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(file => file.type === selectedType);
    }
    
    setFilteredFiles(filtered);
    setCurrentPage(1);
  }, [files, searchTerm, selectedType]);

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/scans/${file.scanId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const scan = await response.json();
      const doc = generateProfessionalPDF(scan);
      doc.save(file.name);
    } catch (err) {
      console.error('Failed to download report:', err);
      alert('Failed to download report');
    }
  };

  return (
    <div className="relative bg-[#101010] w-full font-sans py-4">
      <div className="relative w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-4 px-2 sm:px-0">Generated Reports</h1>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#101010] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 transition"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#101010] border border-white/10 text-white focus:outline-none focus:border-yellow-500 transition"
          >
            <option value="">All Types</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
          </select>
        </div>
        
        <div>
          {loading ? (
            <p className="text-center text-white/40 py-8">Loading reports...</p>
          ) : filteredFiles.length > 0 ? (
            <>
              {paginatedFiles.map(file => (
                <FileItem key={file.id} file={file} onDownload={handleDownload} />
              ))}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 px-2 sm:px-0">
                  <p className="text-sm text-white/40">
                    Showing {paginatedFiles.length} of {filteredFiles.length} reports
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#101010] px-3 py-2 text-sm text-white/80 hover:border-yellow-400/30 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <span className="text-sm text-white/60">Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#101010] px-3 py-2 text-sm text-white/80 hover:border-yellow-400/30 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-white/40 py-8">No reports found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}
