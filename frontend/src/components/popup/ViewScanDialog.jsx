"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

export default function ViewScanDialog({ open, onOpenChange, scan }) {
  if (!scan) return null;

  // Generate PDF with all vulnerability details
  const handleDownloadPDF = () => {
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
    doc.text(`Date: ${scan.date}`, 10, y);
    y += 7;
    doc.text(`Duration: ${scan.duration}`, 10, y);
    y += 7;
    doc.text(`Total Issues: ${scan.issues}`, 10, y);
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

        if (vuln.url || vuln.affected_url) {
          doc.text(
            doc.splitTextToSize(`URL: ${vuln.url || vuln.affected_url}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.param || vuln.affected_parameter) {
          doc.text(
            doc.splitTextToSize(`Parameter: ${vuln.param || vuln.affected_parameter}`, 180),
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

        if (vuln.solution || vuln.remediation) {
          doc.text(
            doc.splitTextToSize(`Fix: ${vuln.solution || vuln.remediation}`, 180),
            15,
            y
          );
          y += 8;
        }

        if (vuln.cwe || vuln.cwe_id) {
          doc.text(`CWE: CWE-${vuln.cwe || vuln.cwe_id}`, 15, y);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95%] 
          max-w-4xl 
          max-h-[90vh] 
          overflow-hidden 
          rounded-2xl
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex justify-between items-center">
            Scan Details

            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-sky-600 hover:bg-sky-700 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogTitle>

          <DialogDescription>
            Comprehensive vulnerability report for this target.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6 overflow-y-auto pr-2 max-h-[65vh]">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Target URL</p>
              <p className="font-medium text-sky-600 break-all">
                {scan.target}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                className={
                  scan.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }
              >
                {scan.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{scan.date}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p>{scan.duration}</p>
            </div>
          </div>

          {/* Vulnerabilities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Vulnerabilities Found ({scan.issues})
            </h3>

            {scan.vulnerabilities && scan.vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {scan.vulnerabilities.map((vuln, index) => (
                  <div
                    key={vuln.id || index}
                    className="border rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header with Title and Badges */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">
                          {vuln.title}
                        </p>
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
                            🤖 {vuln.ai_type} (
                            {Math.round(vuln.ai_confidence * 100)}%)
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {vuln.description && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-600">
                          {vuln.description}
                        </p>
                      </div>
                    )}

                    {/* Affected URL */}
                    {(vuln.url || vuln.affected_url) && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Affected URL
                        </p>
                        <p className="text-sm text-blue-600 break-all font-mono bg-blue-50 p-2 rounded">
                          {vuln.url || vuln.affected_url}
                        </p>
                      </div>
                    )}

                    {/* Affected Parameter */}
                    {(vuln.param || vuln.affected_parameter) && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Affected Parameter
                        </p>
                        <p className="text-sm text-orange-600 font-mono bg-orange-50 p-2 rounded">
                          {vuln.param || vuln.affected_parameter}
                        </p>
                      </div>
                    )}

                    {/* Evidence/Proof */}
                    {(vuln.evidence || vuln.extracted_results) && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Evidence/Proof
                        </p>
                        <div className="text-sm bg-red-50 p-2 rounded border border-red-200 font-mono text-red-700 max-h-24 overflow-y-auto">
                          {vuln.evidence || vuln.extracted_results}
                        </div>
                      </div>
                    )}

                    {/* Solution/Remediation */}
                    {(vuln.solution || vuln.remediation) && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          How to Fix
                        </p>
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          {vuln.solution || vuln.remediation}
                        </p>
                      </div>
                    )}

                    {/* CWE ID */}
                    {(vuln.cwe || vuln.cwe_id) && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          CWE ID
                        </p>
                        <p className="text-sm text-purple-600 font-mono">
                          CWE-{vuln.cwe || vuln.cwe_id}
                        </p>
                      </div>
                    )}

                    {/* CVSS Score */}
                    {(vuln.cvss_score || vuln.riskdesc) && (
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          CVSS Score
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {vuln.cvss_score || vuln.riskdesc}
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-emerald-600 font-medium">
                No vulnerabilities found 🎉
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
