"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ScanDetailsPage() {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const scanRes = await fetch(`${API_URL}/api/scans/${scanId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (scanRes.ok) {
          const scanData = await scanRes.json();
          setScan(scanData);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Poll for updates every 2 seconds to get AI classification results
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [scanId]);

  const handleDownloadPDF = () => {
    if (!scan) return;
    
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("Security Scan Report", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Target: ${scan.target}`, 10, y);
    y += 7;
    doc.text(`Status: ${scan.status}`, 10, y);
    y += 7;
    doc.text(`Date: ${new Date(scan.created_at).toLocaleString()}`, 10, y);
    y += 7;
    doc.text(`Total Issues: ${scan.vulnerabilities?.length || 0}`, 10, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Vulnerabilities:", 10, y);
    y += 8;

    if (scan.vulnerabilities && scan.vulnerabilities.length > 0) {
      scan.vulnerabilities.forEach((vuln, index) => {
        doc.setFontSize(11);
        doc.text(`${index + 1}. ${vuln.title}`, 10, y);
        y += 6;

        doc.setFontSize(10);
        doc.text(`Severity: ${vuln.severity || 'Unknown'}`, 15, y);
        y += 5;

        if (vuln.description) {
          doc.text(
            doc.splitTextToSize(`Description: ${vuln.description}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.url) {
          doc.text(
            doc.splitTextToSize(`URL: ${vuln.url}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.param) {
          doc.text(
            doc.splitTextToSize(`Parameter: ${vuln.param}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.evidence) {
          doc.text(
            doc.splitTextToSize(`Evidence: ${vuln.evidence}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.solution) {
          doc.text(
            doc.splitTextToSize(`Fix: ${vuln.solution}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.cwe) {
          doc.text(`CWE: CWE-${vuln.cwe}`, 15, y);
          y += 5;
        }

        if (vuln.ai_type) {
          doc.text(`AI Classification: ${vuln.ai_type} (${Math.round(vuln.ai_confidence * 100)}%)`, 15, y);
          y += 5;
        }

        if (vuln.source) {
          doc.text(`Scanner: ${vuln.source}`, 15, y);
          y += 5;
        }

        y += 5;

        if (y > 260) {
          doc.addPage();
          y = 10;
        }
      });
    } else {
      doc.text("No vulnerabilities found.", 10, y);
    }

    doc.save(`scan-report-${scan.target}.pdf`);
  };

  if (loading) return <div className="ml-32 p-6">Loading...</div>;
  if (!scan) return <div className="ml-64 p-6">Scan not found</div>;

  return (
    <div className="ml-32 py-6 space-y-6">
    
      <h1 className="text-3xl font-bold text-[#003366]">
        Scan Report – #{scanId}
      </h1>
      <p className="text-sm text-gray-600">
        Review vulnerabilities found during this scan and assess risk.
      </p>

     
      <Card className="hover:shadow-lg transition-all duration-300 hover:bg-blue-50 border border-transparent">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#003366]">
            Scan Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            Target:{" "}
            <span className="font-medium text-[#003366]">
              {scan.target}
            </span>
          </p>
          <p>
            Status:{" "}
            <span className={`font-medium ${scan.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
              {scan.status}
            </span>
          </p>
          <p>
            Started:{" "}
            <span className="font-medium text-[#003366]">
              {new Date(scan.created_at).toLocaleString()}
            </span>
          </p>
          <p>
            Findings:{" "}
            <Badge variant="destructive" className="font-medium">
              {scan.vulnerabilities?.length || 0} vulnerabilities
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Vulnerabilities List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#003366]">
          Vulnerabilities ({scan.vulnerabilities?.length || 0})
        </h2>
        
        {scan.vulnerabilities && scan.vulnerabilities.length > 0 ? (
          scan.vulnerabilities.map((vuln, index) => (
            <Card
              key={vuln.id || index}
              className="hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-[#003366]">
                    {vuln.title}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Vulnerability #{index + 1}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    className={
                      vuln.severity?.toLowerCase() === "critical"
                        ? "bg-red-600 text-white"
                        : vuln.severity?.toLowerCase() === "high"
                        ? "bg-red-500 text-white"
                        : vuln.severity?.toLowerCase() === "medium"
                        ? "bg-yellow-500 text-white"
                        : vuln.severity?.toLowerCase() === "low"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                    }
                  >
                    {vuln.severity || "Unknown"}
                  </Badge>

                  {vuln.source && (
                    <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">
                      📡 {vuln.source}
                    </Badge>
                  )}

                  {vuln.ai_type && (
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                      🤖 {vuln.ai_type} ({Math.round(vuln.ai_confidence * 100)}%)
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Description */}
                {vuln.description && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-gray-600">
                      {vuln.description}
                    </p>
                  </div>
                )}

                {/* Affected URL */}
                {vuln.url && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Affected URL
                    </p>
                    <p className="text-sm text-blue-600 break-all font-mono bg-blue-50 p-2 rounded">
                      {vuln.url}
                    </p>
                  </div>
                )}

                {/* Affected Parameter */}
                {vuln.param && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Affected Parameter
                    </p>
                    <p className="text-sm text-orange-600 font-mono bg-orange-50 p-2 rounded">
                      {vuln.param}
                    </p>
                  </div>
                )}

                {/* Evidence/Proof */}
                {vuln.evidence && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Evidence/Proof
                    </p>
                    <div className="text-sm bg-red-50 p-2 rounded border border-red-200 font-mono text-red-700 max-h-24 overflow-y-auto">
                      {vuln.evidence}
                    </div>
                  </div>
                )}

                {/* Solution/Remediation */}
                {vuln.solution && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      How to Fix
                    </p>
                    <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                      {vuln.solution}
                    </p>
                  </div>
                )}

                {/* CWE ID */}
                {vuln.cwe && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      CWE ID
                    </p>
                    <p className="text-sm text-purple-600 font-mono">
                      CWE-{vuln.cwe}
                    </p>
                  </div>
                )}

                {/* Reference */}
                {vuln.reference && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Reference
                    </p>
                    <p className="text-sm text-blue-600 break-all">
                      {vuln.reference}
                    </p>
                  </div>
                )}

                {/* CVSS Score */}
                {vuln.cvss_score && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      CVSS Score
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      {vuln.cvss_score}
                    </p>
                  </div>
                )}

                {/* AI Classification */}
                {vuln.ai_type && (
                  <div className="pb-3 border-b">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      AI Classification
                    </p>
                    <p className="text-sm text-purple-600">
                      {vuln.ai_type} ({Math.round(vuln.ai_confidence * 100)}% confidence)
                    </p>
                  </div>
                )}

                {/* Scanner Type */}
                {vuln.source && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Scanner
                    </p>
                    <p className="text-sm text-gray-600">{vuln.source}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No vulnerabilities found for this scan.
          </p>
        )}
      </div>
    </div>
  );
}
