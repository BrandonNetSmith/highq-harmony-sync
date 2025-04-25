
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SyncActivityLogModal, { SyncActivityLog } from "./SyncActivityLogModal";
import { getSyncActivityLogs } from "@/services/syncConfig";
import { useToast } from "@/hooks/use-toast";

const SyncActivity = () => {
  const { toast } = useToast();
  const [activities, setActivities] = useState<SyncActivityLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<SyncActivityLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logs = await getSyncActivityLogs();
        setActivities(logs);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        setError('Failed to fetch activity logs. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to fetch activity logs",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [toast]);

  const handleActivityClick = (activity: SyncActivityLog) => {
    setSelectedLog(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const handleDownloadAllLogs = () => {
    if (!activities.length) return;
    
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Type,Timestamp,Status,Detail,Source,Destination,Error\r\n";
    
    // Add each log as a row
    activities.forEach(log => {
      const row = [
        log.id,
        log.type,
        log.timestamp,
        log.status,
        log.detail ? `"${log.detail.replace(/"/g, '""')}"` : "",
        log.source || "",
        log.destination || "",
        log.error ? `"${log.error.replace(/"/g, '""')}"` : ""
      ];
      csvContent += row.join(',') + "\r\n";
    });
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sync-activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Recent Sync Activity</CardTitle>
          {!loading && activities.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={handleDownloadAllLogs}
            >
              <FileText size={16} />
              Download All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="space-y-2 w-2/3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    <Badge variant={
                      activity.status === "success" 
                        ? "default" 
                        : activity.status === "pending" 
                          ? "outline" 
                          : "destructive"
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No sync activity found.
            </div>
          )}
        </CardContent>
      </Card>

      <SyncActivityLogModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        log={selectedLog}
      />
    </>
  );
};

export default SyncActivity;
