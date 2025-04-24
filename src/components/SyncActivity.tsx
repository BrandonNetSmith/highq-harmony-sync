
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    timestamp: "2024-04-24 10:30:15",
    type: "Contact Sync",
    status: "success",
    detail: "Contact John Doe synced successfully"
  },
  {
    id: 2,
    timestamp: "2024-04-24 10:29:00",
    type: "Form Submission",
    status: "success",
    detail: "New intake form processed"
  },
  {
    id: 3,
    timestamp: "2024-04-24 10:25:30",
    type: "Contact Update",
    status: "error",
    detail: "Failed to update contact details"
  }
];

const SyncActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sync Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between border-b pb-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">{activity.type}</p>
                <p className="text-xs text-muted-foreground">{activity.detail}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                <Badge variant={activity.status === "success" ? "default" : "destructive"}>
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncActivity;
