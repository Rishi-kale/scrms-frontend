"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DynamicTabs, DynamicTabsContent, TabContent } from "@/components/ui/dynamic-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Bell,
  Camera,
  Edit3,
  Save,
  Calendar,
  Activity,
  Award,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Phone,
  Mail,
  Briefcase,
  Trophy,
  Zap
} from "lucide-react";
import { useUser } from "@/lib/user-context";

// Utility function to get user initials
const getUserInitials = (name: string): string => {
  if (!name) return "U";
  const nameParts = name.trim().split(' ');
  if (nameParts.length >= 2) {
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function SalesProfilePage() {
  const { user, isLoading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  // Sales-specific mock data
  const salesStats = {
    totalDeals: 47,
    activeDeals: 12,
    closedDeals: 35,
    winRate: 74.5,
    avgDealSize: "$45,320",
    totalRevenue: "$1,586,200",
    mtdRevenue: "$127,450",
    quota: 85,
    callsMade: 284,
    meetingsBooked: 56,
    proposalsSent: 38,
    avgSalesCycle: "23 days"
  };

  const recentActivity = [
    {
      id: 1,
      type: "deal_won",
      title: "Acme Corp - Enterprise Plan",
      description: "Closed deal worth $85,000",
      timestamp: "2 hours ago",
      status: "won",
      value: "$85,000"
    },
    {
      id: 2,
      type: "meeting_scheduled",
      title: "Demo with Tech Solutions Inc",
      description: "Product demo scheduled",
      timestamp: "5 hours ago",
      status: "scheduled",
      value: null
    },
    {
      id: 3,
      type: "proposal_sent",
      title: "GlobalTech Industries Proposal",
      description: "Sent custom proposal package",
      timestamp: "1 day ago",
      status: "pending",
      value: "$125,000"
    },
    {
      id: 4,
      type: "call_completed",
      title: "Follow-up call with StartupXYZ",
      description: "Discovery call completed",
      timestamp: "2 days ago",
      status: "completed",
      value: null
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "deal_won":
        return <Trophy className="h-4 w-4 text-green-500" />;
      case "meeting_scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "proposal_sent":
        return <Mail className="h-4 w-4 text-purple-500" />;
      case "call_completed":
        return <Phone className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Profile</h1>
          <p className="text-muted-foreground">Manage your account and sales preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
          {isEditing && (
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {/* Avatar Section */}
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src="/api/avatar" alt="Profile" />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {getUserInitials(user?.name || "Sales Rep")}
                    </AvatarFallback>
                  </Avatar>
                  <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                          Upload a new profile picture to personalize your account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Drag and drop an image here, or click to select
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button>Upload</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user?.name || "Sales Representative"}
                  </h2>
                  <p className="text-muted-foreground">{user?.email || "sales@company.com"}</p>
                  <Badge variant="default" className="mt-2">
                    <Zap className="h-3 w-3 mr-1" />
                    Top Performer
                  </Badge>
                </div>

                {/* Roles */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Team & Role</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {user?.userRoles && user.userRoles.length > 0 ? (
                      user.userRoles.map((userRole, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {userRole.role?.name || userRole.role?.key || "Sales Rep"}
                        </Badge>
                      ))
                    ) : (
                      <>
                        <Badge variant="secondary" className="text-xs">Enterprise Sales</Badge>
                        <Badge variant="secondary" className="text-xs">West Region</Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="text-sm font-semibold text-green-600">
                      {salesStats.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Quota Attainment</span>
                    <span className="text-sm font-semibold text-blue-600">{salesStats.quota}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Deals</span>
                    <span className="text-sm font-semibold">{salesStats.activeDeals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                    <span className="text-sm font-semibold text-purple-600">{salesStats.avgDealSize}</span>
                  </div>
                </div>

                <Separator />

                {/* Account Status */}
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Account Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* Tabs */}
          <Card>
            <CardContent className="p-0">
              <DynamicTabs
                tabs={[
                  { id: "overview", label: "Overview", icon: TrendingUp },
                  { id: "personal", label: "Personal Info", icon: Users },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "notifications", label: "Notifications", icon: Bell }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className="w-full"
              >
                <DynamicTabsContent
                  tabs={[
                    { id: "overview", label: "Overview", icon: TrendingUp },
                    { id: "personal", label: "Personal Info", icon: Users },
                    { id: "security", label: "Security", icon: Shield },
                    { id: "notifications", label: "Notifications", icon: Bell }
                  ]}
                >
                  <TabContent tabId="overview">
                    <div className="space-y-6">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Total Revenue</span>
                          </div>
                          <p className="text-2xl font-bold text-green-700">{salesStats.totalRevenue}</p>
                          <p className="text-xs text-green-600">All-time earnings</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">MTD Revenue</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-700">{salesStats.mtdRevenue}</p>
                          <p className="text-xs text-blue-600">Month to date</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Active Deals</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-700">{salesStats.activeDeals}</p>
                          <p className="text-xs text-purple-600">In pipeline</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <Trophy className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Win Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-orange-700">{salesStats.winRate}%</p>
                          <p className="text-xs text-orange-600">Success rate</p>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Calls Made</span>
                              <Phone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold">{salesStats.callsMade}</p>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Meetings Booked</span>
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold">{salesStats.meetingsBooked}</p>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Proposals Sent</span>
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold">{salesStats.proposalsSent}</p>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Avg Sales Cycle</span>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold">{salesStats.avgSalesCycle}</p>
                            <p className="text-xs text-green-600 mt-2">↓ 3 days faster</p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                  {activity.value && (
                                    <span className="text-xs font-semibold text-green-600">
                                      {activity.value}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className={`text-xs flex-shrink-0 ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent tabId="personal">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            defaultValue={user?.name || ""}
                            disabled={!isEditing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue={user?.email || ""}
                            disabled={!isEditing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            defaultValue="+1 (555) 987-6543"
                            disabled={!isEditing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="territory">Sales Territory</Label>
                          <Input
                            id="territory"
                            defaultValue="West Coast - Enterprise"
                            disabled={!isEditing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            defaultValue="Senior Sales Executive"
                            disabled={!isEditing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="manager">Reporting Manager</Label>
                          <Input
                            id="manager"
                            defaultValue="Sarah Johnson"
                            disabled={!isEditing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="bio">Professional Bio</Label>
                          <textarea
                            id="bio"
                            rows={3}
                            defaultValue="Results-driven sales professional with 8+ years of experience in enterprise B2B sales. Specialized in SaaS solutions and strategic account management."
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent tabId="security">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              className="w-full pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            className="w-full"
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Security Settings</h4>
                          <div className="flex items-center space-x-2">
                            <Switch id="twoFactor" />
                            <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch id="loginAlerts" defaultChecked />
                            <Label htmlFor="loginAlerts">Login Alerts</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent tabId="notifications">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Communication Preferences</h4>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="emailNotifications" className="text-sm font-medium">
                              Email Notifications
                            </Label>
                            <p className="text-xs text-muted-foreground">Receive deal updates via email</p>
                          </div>
                          <Switch id="emailNotifications" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="pushNotifications" className="text-sm font-medium">
                              Push Notifications
                            </Label>
                            <p className="text-xs text-muted-foreground">Browser and mobile alerts</p>
                          </div>
                          <Switch id="pushNotifications" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="smsNotifications" className="text-sm font-medium">
                              SMS Notifications
                            </Label>
                            <p className="text-xs text-muted-foreground">Text alerts for urgent deals</p>
                          </div>
                          <Switch id="smsNotifications" />
                        </div>
                        
                        <Separator />
                        
                        <h4 className="font-medium">Sales Alerts</h4>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="dealAlerts" className="text-sm font-medium">
                              Deal Stage Changes
                            </Label>
                            <p className="text-xs text-muted-foreground">Notify when deals move stages</p>
                          </div>
                          <Switch id="dealAlerts" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="leadAlerts" className="text-sm font-medium">
                              New Lead Assignments
                            </Label>
                            <p className="text-xs text-muted-foreground">Notify on new lead assignments</p>
                          </div>
                          <Switch id="leadAlerts" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="quotaAlerts" className="text-sm font-medium">
                              Quota Milestones
                            </Label>
                            <p className="text-xs text-muted-foreground">Celebrate quota achievements</p>
                          </div>
                          <Switch id="quotaAlerts" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </TabContent>
                </DynamicTabsContent>
              </DynamicTabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}