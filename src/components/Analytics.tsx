import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users,
  AlertTriangle
} from "lucide-react";

const weeklyData = [
  { day: 'Mon', sent: 45, delivered: 42, failed: 3 },
  { day: 'Tue', sent: 52, delivered: 48, failed: 4 },
  { day: 'Wed', sent: 38, delivered: 36, failed: 2 },
  { day: 'Thu', sent: 61, delivered: 58, failed: 3 },
  { day: 'Fri', sent: 55, delivered: 52, failed: 3 },
  { day: 'Sat', sent: 28, delivered: 26, failed: 2 },
  { day: 'Sun', sent: 22, delivered: 21, failed: 1 },
];

const departmentData = [
  { name: 'Laboratory', value: 65, color: '#0ea5e9' },
  { name: 'Radiology', value: 25, color: '#10b981' },
  { name: 'Gastroenterology', value: 10, color: '#f59e0b' },
];

const performanceMetrics = [
  {
    title: "Average Delivery Time",
    value: "2.3s",
    change: -0.5,
    trend: "down",
    description: "0.5s faster than last week"
  },
  {
    title: "Success Rate",
    value: "97.8%",
    change: 1.2,
    trend: "up",
    description: "1.2% improvement"
  },
  {
    title: "Patient Engagement",
    value: "89.4%",
    change: 2.1,
    trend: "up",
    description: "Patients reading notifications"
  },
  {
    title: "System Uptime",
    value: "99.9%",
    change: 0,
    trend: "stable",
    description: "Consistent performance"
  }
];

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system performance and notification delivery metrics
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
              {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-success" />}
              {metric.trend === 'stable' && <Activity className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
              {metric.change !== 0 && (
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'secondary'} 
                  className="mt-2"
                >
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Delivery Trends */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Weekly Delivery Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Notifications by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Health Indicators */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bot Response Time</span>
                <span>Excellent</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Performance</span>
                <span>Good</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>File Processing</span>
                <span>Optimal</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};