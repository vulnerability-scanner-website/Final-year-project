import { Button } from '@/components/ui/button-1';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Play, Pause, StopCircle, RotateCcw, Trash, Eye, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScanCard({ scan, onAction, onViewDetails }) {
  const total = 100;
  const progress = scan.progress || 0;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="border-0 min-h-auto py-5">
        <CardTitle className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">{scan.name}</span>
        </CardTitle>
        <CardToolbar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="dim" size="sm" mode="icon" className="-me-1.5">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onClick={() => onViewDetails(scan.id)}>
                <Eye />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('pause', scan.id)}>
                <Pause />
                Pause Scan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('resume', scan.id)}>
                <Play />
                Resume Scan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction('stop', scan.id)}>
                <StopCircle />
                Stop Scan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('rerun', scan.id)}>
                <RotateCcw />
                Re-run Scan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('delete', scan.id)}>
                <Trash />
                Delete Scan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardToolbar>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {/* Progress Bar */}
        <div className="flex grow gap-1">
          {[...Array(total)].map((_, i) => (
            <span
              key={i}
              className={cn(
                `inline-block w-3 h-4 rounded-sm border transition-colors`,
                i < progress ? 'bg-primary border-primary' : 'bg-muted border-muted',
              )}
            />
          ))}
        </div>

        {/* Progress Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>{scan.target}</span>
          <span className="font-semibold text-foreground">{progress}% complete</span>
        </div>
        
        {/* Status and Time */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Started: {scan.started}</span>
          <span className={cn(
            "font-semibold",
            scan.status === "Running" ? "text-green-600" :
            scan.status === "Queued" ? "text-yellow-600" :
            "text-blue-600"
          )}>{scan.status}</span>
        </div>
      </CardContent>
    </Card>
  );
}
