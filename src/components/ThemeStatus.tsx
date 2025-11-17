"use client";

import { useTheme } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThemeStatus() {
  const { theme, getStoredTheme } = useTheme();
  const storedTheme = getStoredTheme();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Theme Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Theme:</span>
          <Badge variant="outline">{theme}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Stored in localStorage:</span>
          <Badge variant={storedTheme === theme ? "default" : "destructive"}>
            {storedTheme || 'None'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {storedTheme === theme 
            ? "✅ Theme is properly persisted in localStorage" 
            : "⚠️ Theme not properly stored in localStorage"
          }
        </div>
      </CardContent>
    </Card>
  );
}
