import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { reportsAPI } from '@/lib/api';

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
const ActionButton = ({ status, onCancel }) => {
  if (status === 'downloading') {
    return (
      <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 font-semibold text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200">
        Cancel
      </button>
    );
  }
  return (
    <button className="flex items-center text-blue-600 dark:text-blue-500 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-400 transition-colors duration-200">
      <Download className="h-4 w-4 mr-1" />
      Download
    </button>
  );
};

// --- Main File Item Component ---
const FileItem = ({ file, onCancel }) => {
  const { name, subtype, size, status, progress } = file;
  const displaySize = size < 1 ? `${(size * 1000).toFixed(0)} KB` : `${size} MB`;

  return (
    <div className="flex flex-wrap items-center py-3">
      <div className="flex items-center flex-grow min-w-0">
        <FileIcon />
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
          {status === 'downloading' ? (
            <ProgressBar progress={progress} />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtype}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end w-full sm:w-auto mt-2 sm:mt-0 pl-[72px] sm:pl-0">
        <div className="flex-shrink-0 w-20 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
          {displaySize}
        </div>
        <div className="flex-shrink-0 w-24 text-right">
          <ActionButton status={status} onCancel={() => onCancel(file.id)} />
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
  const [loading, setLoading] = useState(true);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportsAPI.getAll();
        const formattedData = data.map(report => ({
          ...report,
          progress: 100,
          originalSubtype: report.subtype
        }));
        setFiles(formattedData);
        setFilteredFiles(formattedData);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        // Fallback to mock data if API fails
        const mockData = [
          { id: 1, name: 'OWASP Top 10 Vulnerability Assessment Report.pdf', type: 'Weekly', size: 4.5, status: 'complete', subtype: 'Weekly Security Report', progress: 100, originalSubtype: 'Weekly Security Report' },
          { id: 2, name: 'SQL Injection Attack Analysis Report.pdf', type: 'Critical', size: 2.3, status: 'complete', subtype: 'Critical Vulnerability Report', progress: 100, originalSubtype: 'Critical Vulnerability Report' },
        ];
        setFiles(mockData);
        setFilteredFiles(mockData);
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
  }, [files, searchTerm, selectedType]);

  // Effect for download simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFiles(currentFiles =>
        currentFiles.map(file => {
          if (file.status === 'downloading' && file.progress < 100) {
            const increment = Math.random() * 8;
            const newProgress = Math.min(file.progress + increment, 100);
            if (newProgress >= 100) {
              return { ...file, progress: 100, status: 'complete', subtype: file.originalSubtype };
            }
            return { ...file, progress: newProgress };
          }
          return file;
        }));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = (fileId) => {
    setFiles(currentFiles =>
      currentFiles.map(file =>
        file.id === fileId ? { ...file, status: 'complete', progress: 100, subtype: 'Cancelled' } : file));
  };

  return (
    <div className="relative bg-slate-50 dark:bg-slate-900 min-h-screen w-full flex items-center justify-center font-sans transition-colors duration-300 py-8">
      <GridBackground />
      <div className="relative w-full max-w-4xl mx-4 sm:mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 px-2 sm:px-0">Generated Reports</h1>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Types</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        
        <div>
          {filteredFiles.map(file => (
            <FileItem key={file.id} file={file} onCancel={handleCancel} />
          ))}
          {filteredFiles.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No reports found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}
