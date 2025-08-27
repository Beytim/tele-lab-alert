import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { PatientManagement } from "@/components/PatientManagement";
import { NotificationHistory } from "@/components/NotificationHistory";
import { BotConfiguration } from "@/components/BotConfiguration";
import { SetupInstructions } from "@/components/SetupInstructions";
import { Activity, Users, Send, CheckCircle, Stethoscope, Heart, Zap } from "lucide-react";

export const GIDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { title: "Total Procedures", value: "842", icon: Stethoscope, change: "+8%" },
    { title: "Pending Results", value: "15", icon: Heart, change: "-3%" },
    { title: "Sent Today", value: "67", icon: Send, change: "+15%" },
    { title: "Success Rate", value: "97.8%", icon: CheckCircle, change: "+1%" },
  ];

  const recentActivity = [
    { patient: "Sara Mohammed", procedure: "Colonoscopy", status: "completed", time: "1 hour ago" },
    { patient: "Ibrahim Hassan", procedure: "Upper Endoscopy", status: "pending", time: "3 hours ago" },
    { patient: "Maryam Ali", procedure: "ERCP", status: "sent", time: "5 hours ago" },
    { patient: "Yusuf Ahmed", procedure: "EUS", status: "error", time: "7 hours ago" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Activity className="h-4 w-4 text-yellow-500" />;
      case "sent": return <Send className="h-4 w-4 text-blue-500" />;
      case "error": return <Zap className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default" as const;
      case "pending": return "secondary" as const;
      case "sent": return "outline" as const;
      case "error": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Stethoscope className="h-12 w-12" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  Girum Hospital
                </h1>
              </div>
              <span className="block text-2xl font-medium text-white/90 mb-6">Gastroenterology Department</span>
              <p className="mt-6 text-lg leading-8 text-white/90">
                Comprehensive GI procedure notification system for endoscopy, ERCP, and EUS results
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button variant="secondary" size="lg" className="shadow-lg">
                  <Heart className="mr-2 h-5 w-5" />
                  View Procedures
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Users className="mr-2 h-5 w-5" />
                  Patient Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last week
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload Results</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="bot">Bot Config</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent GI Procedures
                  </CardTitle>
                  <CardDescription>Latest gastroenterology procedures and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="font-medium">{activity.patient}</p>
                          <p className="text-sm text-muted-foreground">{activity.procedure}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusVariant(activity.status)} className="mb-1">
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Department Status</CardTitle>
                  <CardDescription>Current GI department performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Endoscopy Suite</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telegram Bot</span>
                    <Badge variant="default">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Report Processing</span>
                    <Badge variant="secondary">Queue: 2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notification Service</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <FileUpload />
          </TabsContent>

          <TabsContent value="patients">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="history">
            <NotificationHistory />
          </TabsContent>

          <TabsContent value="bot">
            <BotConfiguration />
          </TabsContent>

          <TabsContent value="setup">
            <SetupInstructions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};