"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, RotateCcw, Settings, Brain, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useConfig } from "@/lib/config-context";
import { useNotify } from "@/components/ui/NotificationProvider";

export default function ConfigurePage() {
  const router = useRouter();
  const { config, updateConfig, resetConfig } = useConfig();
  const { notify } = useNotify();
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof typeof config) => {
    updateConfig({ [key]: !config[key] });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Configuration is automatically saved to localStorage via the context
    setHasChanges(false);
    notify("Configuration saved successfully", "success");
  };

  const handleReset = () => {
    resetConfig();
    setHasChanges(true);
    notify("Configuration reset to defaults", "info");
  };

  const handleBack = () => {
    if (hasChanges) {
      const shouldSave = confirm("You have unsaved changes. Do you want to save before leaving?");
      if (shouldSave) {
        handleSave();
      }
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize your application experience
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Application Configuration</h2>
            <p className="text-muted-foreground">
              Configure which features and options are visible in your application interface.
            </p>
          </div>

          {/* Configuration Sections */}
          <div className="grid gap-6">
            {/* UI Features Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  User Interface Features
                </CardTitle>
                <CardDescription>
                  Control the visibility of various UI elements and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Tools Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="ai-tools" className="text-base font-medium">
                        AI Tools Section
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show/hide the AI Tools section in the sidebar navigation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ai-tools"
                      checked={config.showAITools}
                      onCheckedChange={() => handleToggle('showAITools')}
                    />
                    <Badge 
                      variant={config.showAITools ? "default" : "secondary"}
                      className={config.showAITools ? "bg-primary text-primary-foreground" : "bg-teal-600 text-white"}
                    >
                      {config.showAITools ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Moon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <Label htmlFor="dark-mode" className="text-base font-medium">
                        Dark Mode Toggle
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show/hide the dark mode toggle in the header
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dark-mode"
                      checked={config.showDarkMode}
                      onCheckedChange={() => handleToggle('showDarkMode')}
                    />
                    <Badge 
                      variant={config.showDarkMode ? "default" : "secondary"}
                      className={config.showDarkMode ? "bg-primary text-primary-foreground" : "bg-teal-600 text-white"}
                    >
                      {config.showDarkMode ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Configuration Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Current Configuration</CardTitle>
                <CardDescription>
                  Summary of your current application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">AI Tools Section</span>
                    <Badge 
                      variant={config.showAITools ? "default" : "secondary"}
                      className={config.showAITools ? "bg-primary text-primary-foreground" : "bg-teal-600 text-white"}
                    >
                      {config.showAITools ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Dark Mode Toggle</span>
                    <Badge 
                      variant={config.showDarkMode ? "default" : "secondary"}
                      className={config.showDarkMode ? "bg-primary text-primary-foreground" : "bg-teal-600 text-white"}
                    >
                      {config.showDarkMode ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>

          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-blue-100 rounded">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900">Configuration Information</h4>
                  <p className="text-sm text-blue-700">
                    Your configuration settings are automatically saved to your browser's local storage. 
                    Changes take effect immediately and will persist across browser sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
