"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst";

const vulnerabilities = [
  {
    id: 1,
    scanId: 1,
    severity: "Critical",
    title: "SQL Injection",
    description:
      "An attacker can manipulate your database queries by injecting malicious SQL commands.",
    example: "' OR 1=1; DROP TABLE users; --",
  },
  {
    id: 2,
    scanId: 1,
    severity: "High",
    title: "Stored XSS",
    description:
      "Malicious scripts can execute when other users view the page.",
    example: "<script>alert('XSS')</script>",
  },
  {
    id: 3,
    scanId: 2,
    severity: "Medium",
    title: "Open Redirect",
    description: "Improper URL handling may redirect users to malicious sites.",
    example: "https://yourdomain.com/redirect?url=https://evil.com",
  },
];

export default function ScanDetailsPage() {
  const { scanId } = useParams();
  const scanIdNum = Number(scanId);

  const scanVulnerabilities = vulnerabilities.filter(
    (v) => v.scanId === scanIdNum,
  );

  return (
    <>
      <AnalystSideBar />
      <div className="ml-64 p-6 space-y-6 min-h-screen bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Scan Report – #{scanId}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review vulnerabilities found during this scan and assess risk.
          </p>
        </div>

        {/* Scan Overview */}
        <Card className="hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Scan Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              Target:{" "}
              <span className="font-medium text-orange-600">
                https://example.com
              </span>
            </p>
            <p>
              Status:{" "}
              <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Completed</span>
            </p>
            <p>
              Duration:{" "}
              <span className="font-medium text-orange-600">12 minutes</span>
            </p>
            <p>
              Findings:{" "}
              <Badge variant="destructive" className="font-medium bg-red-500">
                {scanVulnerabilities.length} vulnerabilities
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Separator className="bg-orange-200" />

        {/* Vulnerabilities List */}
        <div className="space-y-6">
          {scanVulnerabilities.length > 0 ? (
            scanVulnerabilities.map((v) => (
              <Card
                key={v.id}
                className="hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200"
              >
                <CardHeader className="flex flex-row justify-between items-start">
                  <CardTitle className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    {v.title}
                  </CardTitle>
                  <Badge
                    variant={
                      v.severity === "Critical"
                        ? "destructive"
                        : v.severity === "High"
                          ? "warning"
                          : "secondary"
                    }
                    className={`font-medium ${
                      v.severity === "Critical" 
                        ? "bg-red-500" 
                        : v.severity === "High"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    } text-white`}
                  >
                    {v.severity}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>{v.description}</p>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg font-mono text-orange-700 border border-orange-200">
                    {v.example}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center border border-orange-100">
              <p className="text-gray-500">
                No vulnerabilities found for this scan.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}