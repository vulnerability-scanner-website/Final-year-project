import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function StatsCard({ title, value, description, icon: Icon }) {
  return (
    <Card className="bg-[#1a1a1a] border border-yellow-500/20 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/50">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-yellow-400" />}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold text-yellow-400">{value}</div>
        {description && (
          <p className="text-xs text-white/30 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
