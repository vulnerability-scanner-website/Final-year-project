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

  // ✅ Generate PDF
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
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${vuln.title}`, 10, y);
        y += 6;

        doc.text(`Severity: ${vuln.severity}`, 15, y);
        y += 6;

        doc.text(
          doc.splitTextToSize(`Description: ${vuln.description}`, 180),
          15,
          y
        );
        y += 10;

        doc.text(
          doc.splitTextToSize(`Fix: ${vuln.fix}`, 180),
          15,
          y
        );
        y += 12;

        // Add new page if content is too long
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
          max-w-3xl 
          max-h-[90vh] 
          overflow-hidden 
          rounded-2xl
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex justify-between items-center">
            Scan Details

            {/* PDF Download Button */}
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-sky-600 bg-gray-500 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogTitle>

          <DialogDescription>
            Vulnerability report for this target.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
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

         
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Vulnerabilities Found ({scan.issues})
            </h3>

            {scan.vulnerabilities &&
            scan.vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {scan.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="border rounded-xl p-4 bg-gray-50 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                      <p className="font-semibold">{vuln.title}</p>

                      <Badge
                        className={
                          vuln.severity === "High"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : vuln.severity === "Medium"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }
                      >
                        {vuln.severity}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {vuln.description}
                    </p>

                    <div className="bg-white p-3 rounded-md border text-sm">
                      <span className="font-semibold text-gray-700">
                        How to Fix:
                      </span>{" "}
                      {vuln.fix}
                    </div>
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