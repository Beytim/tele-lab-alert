import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Users, 
  FileSpreadsheet, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Upload,
  MessageSquare,
  FlaskConical
} from "lucide-react";
import { FileUpload } from "./FileUpload";
import { PatientManagement } from "./PatientManagement";
import { NotificationHistory } from "./NotificationHistory";
import { BotConfiguration } from "./BotConfiguration";
import { SetupInstructions } from "./SetupInstructions";
import labHero from "@/assets/lab-hero.jpg";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const stats = {
    totalPatients: 1247,
    pendingResults: 23,
    sentToday: 89,
    successRate: 97.2
  };

  const recentActivity = [
    { id: 1, patient: "John Smith", test: "Complete Blood Count", status: "sent", time: "2 minutes ago" },
    { id: 2, patient: "Sarah Johnson", test: "Lipid Panel", status: "pending", time: "5 minutes ago" },
    { id: 3, patient: "Mike Davis", test: "Thyroid Function", status: "sent", time: "8 minutes ago" },
    { id: 4, patient: "Emily Brown", test: "Glucose Test", status: "failed", time: "12 minutes ago" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "sent": return "default" as const;
      case "pending": return "secondary" as const;
      case "failed": return "destructive" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 py-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FlaskConical className="h-12 w-12" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Laboratory Department
                </h1>
              </div>
              <p className="mt-4 text-lg leading-8 text-white/90">
                Automated lab result notifications with intelligent patient matching
              </p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button variant="secondary" size="lg" className="shadow-lg">
                  <FlaskConical className="mr-2 h-5 w-5" />
                  Upload Lab Results
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Users className="mr-2 h-5 w-5" />
                  Manage Patients
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalPatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active in system</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingResults}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <Send className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.sentToday}</div>
              <p className="text-xs text-muted-foreground">Notifications delivered</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.successRate}%</div>
              <Progress value={stats.successRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Bot Settings</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="font-medium">{activity.patient}</p>
                          <p className="text-sm text-muted-foreground">{activity.test}</p>
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

              {/* System Status */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Telegram Bot</span>
                    <Badge variant="default" className="bg-success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge variant="default" className="bg-success">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Processing</span>
                    <Badge variant="default" className="bg-success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notification Queue</span>
                    <Badge variant="secondary">{stats.pendingResults} pending</Badge>
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

          <TabsContent value="notifications">
            <NotificationHistory />
          </TabsContent>

          <TabsContent value="settings">
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