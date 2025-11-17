"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabConfig } from "@/config/tabs";
import { cn } from "@/lib/utils";

interface DynamicTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  showIcons?: boolean;
  showDescriptions?: boolean;
  gridCols?: number;
  children: React.ReactNode;
}

export function DynamicTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  showIcons = true,
  showDescriptions = false,
  gridCols,
  children
}: DynamicTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={cn("space-y-6", className)}>
      <TabsList
        className={cn(
          gridCols ? `grid w-full grid-cols-${gridCols}` : "grid w-full grid-cols-4",
          tabsListClassName
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                "flex items-center gap-2",
                showDescriptions && "flex-col h-auto py-3",
                tabsTriggerClassName
              )}
            >
              {showIcons && Icon && <Icon className="h-4 w-4" />}
              <div className="flex flex-col items-center">
                <span className="font-medium">{tab.label}</span>
                {showDescriptions && tab.description && (
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    {tab.description}
                  </span>
                )}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {children}
    </Tabs>
  );
}

interface DynamicTabsContentProps {
  tabs: TabConfig[];
  children: React.ReactNode;
}

export function DynamicTabsContent({ tabs, children }: DynamicTabsContentProps) {
  return (
    <>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-6">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              const element = child as React.ReactElement<{ "data-tab"?: string }>;
              if (element.props["data-tab"] === tab.id) {
                return element;
              }
            }
            return null;
          })}
        </TabsContent>
      ))}
    </>
  );
}

// Helper component for tab content
export function TabContent({ tabId, children }: { tabId: string; children: React.ReactNode }) {
  return <div data-tab={tabId}>{children}</div>;
}
