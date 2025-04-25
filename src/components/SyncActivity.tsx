
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SyncActivityLogModal, { SyncActivityLog } from "./SyncActivityLogModal";
import { getSyncActivityLogs } from "@/services/syncConfig";

const SyncActivity = () => {
  const [activities, setActivities] = useState<SyncActivityLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<SyncActivityLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const logs = await getSyncActivityLogs();
        setActivities(logs);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleActivityClick = (activity: SyncActivityLog) => {
    setSelectedLog(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
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
