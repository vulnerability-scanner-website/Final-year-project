"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <div className="ml-64 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Scan Report – #{scanId}</h1>
      <p className="text-sm text-muted-foreground">
        Review vulnerabilities found during this scan and assess risk.
      </p>

      {/* Scan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Target: <span className="font-medium">https://example.com</span>
          </p>
          <p>
            Status: <span className="font-medium">Completed</span>
          </p>
          <p>
            Duration: <span className="font-medium">12 minutes</span>
          </p>
          <p>
            Findings:{" "}
            <Badge variant="destructive">
              {scanVulnerabilities.length} vulnerabilities
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {scanVulnerabilities.map((v) => (
          <Card key={v.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">{v.title}</CardTitle>
              <Badge
                variant={
                  v.severity === "Critical"
                    ? "destructive"
                    : v.severity === "High"
                      ? "warning"
                      : "secondary"
                }
              >
                {v.severity}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{v.description}</p>
              <div className="bg-muted p-2 rounded font-mono">{v.example}</div>
            </CardContent>
          </Card>
        ))}

        {scanVulnerabilities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No vulnerabilities found for this scan.
          </p>
        )}
      </div>
    </div>
  );
}
