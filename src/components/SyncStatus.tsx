
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

const SyncStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              <span>GoHighLevel Connection</span>
            </div>
            <Badge variant="outline" className="bg-green-50">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              <span>IntakeQ Connection</span>
            </div>
            <Badge variant="outline" className="bg-green-50">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              <span>Last Sync</span>
            </div>
            <Badge variant="outline">2 minutes ago</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncStatus;
