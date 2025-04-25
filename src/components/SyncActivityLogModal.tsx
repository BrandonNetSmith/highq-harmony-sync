
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export type SyncActivityLog = {
  id: number;
  timestamp: string;
  type: string;
  status: "success" | "error" | "pending";
  detail: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  error?: string;
  source?: string;
  destination?: string;
}

interface SyncActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: SyncActivityLog | null;
}

const SyncActivityLogModal: React.FC<SyncActivityLogModalProps> = ({
  isOpen,
  onClose,
  log
}) => {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {log.type}
            <Badge variant={log.status === "success" ? "default" : log.status === "pending" ? "outline" : "destructive"}>
              {log.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {log.timestamp}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Details</h3>
            <p className="text-sm text-muted-foreground">{log.detail}</p>
          </div>
          
          {log.source && (
            <div>
              <h3 className="text-sm font-medium">Source</h3>
              <p className="text-sm text-muted-foreground">{log.source}</p>
            </div>
          )}

          {log.destination && (
            <div>
              <h3 className="text-sm font-medium">Destination</h3>
              <p className="text-sm text-muted-foreground">{log.destination}</p>
            </div>
          )}

          {log.error && (
            <div>
              <h3 className="text-sm font-medium text-destructive">Error</h3>
              <p className="text-sm text-destructive">{log.error}</p>
            </div>
          )}

          {log.changes && log.changes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Changes</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {log.changes.map((change, idx) => (
                    <div key={idx} className="border rounded-md p-2">
                      <p className="text-sm font-medium">{change.field}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Previous:</span> {change.oldValue || '(empty)'}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">New:</span> {change.newValue || '(empty)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncActivityLogModal;
