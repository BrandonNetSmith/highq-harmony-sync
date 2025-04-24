
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WebhookConfig = () => {
  const [ghlWebhook, setGhlWebhook] = useState('');
  const [intakeqWebhook, setIntakeqWebhook] = useState('');
  const { toast } = useToast();

  const handleSaveWebhooks = () => {
    if (!ghlWebhook || !intakeqWebhook) {
      toast({
        title: "Validation Error",
        description: "Please enter both webhook URLs",
        variant: "destructive",
      });
      return;
    }
    // Save webhooks to localStorage for now
    localStorage.setItem('ghlWebhook', ghlWebhook);
    localStorage.setItem('intakeqWebhook', intakeqWebhook);
    toast({
      title: "Success",
      description: "Webhook configurations saved successfully",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>GoHighLevel Webhook</CardTitle>
          <CardDescription>Configure your GoHighLevel webhook endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter GoHighLevel webhook URL"
            value={ghlWebhook}
            onChange={(e) => setGhlWebhook(e.target.value)}
            className="mb-4"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>IntakeQ Webhook</CardTitle>
          <CardDescription>Configure your IntakeQ webhook endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter IntakeQ webhook URL"
            value={intakeqWebhook}
            onChange={(e) => setIntakeqWebhook(e.target.value)}
            className="mb-4"
          />
        </CardContent>
      </Card>
      
      <div className="md:col-span-2 flex justify-end">
        <Button onClick={handleSaveWebhooks}>Save Webhook Configuration</Button>
      </div>
    </div>
  );
};

export default WebhookConfig;
