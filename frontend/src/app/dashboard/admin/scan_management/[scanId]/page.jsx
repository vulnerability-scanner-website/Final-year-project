"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ScanDetailsPage() {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [scanRes, vulnRes] = await Promise.all([
          fetch(`http://localhost:5000/api/scans/${scanId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/scans/${scanId}/vulnerabilities`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (scanRes.ok) setScan(await scanRes.json());
        if (vulnRes.ok) setVulnerabilities(await vulnRes.json());
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [scanId]);

  if (loading) return <div className="ml-32 p-6">Loading...</div>;
  if (!scan) return <div className="ml-64 p-6">Scan not found</div>;

  return (
    <div className="ml-32 p-6 space-y-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-[#003366]">
        Scan Report – #{scanId}
      </h1>
      <p className="text-sm text-gray-600">
        Review vulnerabilities found during this scan and assess risk.
      </p>

      {/* Scan Overview */}
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
              {vulnerabilities.length} vulnerabilities
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Vulnerabilities List */}
      <div className="space-y-6">
        {vulnerabilities.length > 0 ? (
          vulnerabilities.map((v) => (
            <Card
              key={v.id}
              className="hover:shadow-lg transition-all duration-300 hover:bg-blue-50 border border-transparent"
            >
              <CardHeader className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-[#003366]">
                  {v.title}
                </CardTitle>
                <Badge
                  variant={
                    v.severity === "critical" || v.severity === "high"
                      ? "destructive"
                      : v.severity === "medium"
                        ? "warning"
                        : "secondary"
                  }
                  className="font-medium uppercase"
                >
                  {v.severity}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                {v.description && <p>{v.description}</p>}
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
