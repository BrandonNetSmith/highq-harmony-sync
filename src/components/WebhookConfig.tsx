
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ApiConfigForm {
  ghlApiKey: string;
  intakeqApiKey: string;
}

const WebhookConfig = () => {
  const { toast } = useToast();
  const form = useForm<ApiConfigForm>();

  const onSubmit = async (data: ApiConfigForm) => {
    try {
      // This will be replaced with Supabase secret storage later
      localStorage.setItem('ghlApiKey', data.ghlApiKey);
      localStorage.setItem('intakeqApiKey', data.intakeqApiKey);
      
      toast({
        title: "Success",
        description: "API keys saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>GoHighLevel API</CardTitle>
          <CardDescription>Configure your GoHighLevel API key</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ghlApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter GoHighLevel API key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>IntakeQ API</CardTitle>
          <CardDescription>Configure your IntakeQ API key</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="intakeqApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter IntakeQ API key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="md:col-span-2 flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)}>Save API Configuration</Button>
      </div>
    </div>
  );
};

export default WebhookConfig;
