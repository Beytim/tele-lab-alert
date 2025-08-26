import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Download
} from "lucide-react";

interface Notification {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending' | 'scheduled';
  sentAt: string;
  deliveredAt?: string;
  message: string;
  retryCount: number;
  errorMessage?: string;
  batchId?: string;
}

export const NotificationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7days");
  
  // Mock notification data
  const [notifications] = useState<Notification[]>([
    {
      id: "N001",
      patientName: "John Smith",
      patientId: "P001",
      testName: "Complete Blood Count",
      status: "delivered",
      sentAt: "2024-01-20T10:30:00Z",
      deliveredAt: "2024-01-20T10:30:15Z",
      message: "Your CBC results are ready. All values are within normal range.",
      retryCount: 0,
      batchId: "B001"
    },
    {
      id: "N002",
      patientName: "Sarah Johnson",
      patientId: "P002",
      testName: "Lipid Panel",
      status: "sent",
      sentAt: "2024-01-20T09:15:00Z",
      message: "Your lipid panel results are ready. Please review the attached report.",
      retryCount: 0,
      batchId: "B001"
    },
    {
      id: "N003",
      patientName: "Mike Davis",
      patientId: "P003",
      testName: "Thyroid Function",
      status: "failed",
      sentAt: "2024-01-20T08:45:00Z",
      message: "Your thyroid function test results are ready.",
      retryCount: 2,
      errorMessage: "User blocked the bot",
      batchId: "B002"
    },
    {
      id: "N004",
      patientName: "Emily Brown",
      patientId: "P004",
      testName: "Glucose Test",
      status: "scheduled",
      sentAt: "2024-01-20T14:00:00Z",
      message: "Your glucose test results are ready. Fasting glucose: 95 mg/dL (Normal).",
      retryCount: 0,
      batchId: "B003"
    },
    {
      id: "N005",
      patientName: "Robert Wilson",
      patientId: "P005",
      testName: "Liver Function Panel",
      status: "pending",
      sentAt: "2024-01-20T11:20:00Z",
      message: "Your liver function test results are ready.",
      retryCount: 1,
      batchId: "B003"
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    
    // For date filtering, we'll just show all for this demo
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: Notification['status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'sent': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: Notification['status']) => {
    switch (status) {
      case 'delivered': return 'default' as const;
      case 'sent': return 'secondary' as const;
      case 'failed': return 'destructive' as const;
      case 'pending': return 'outline' as const;
      case 'scheduled': return 'outline' as const;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryTime = (notification: Notification) => {
    if (notification.deliveredAt && notification.sentAt) {
      const sent = new Date(notification.sentAt);
      const delivered = new Date(notification.deliveredAt);
      const diffMs = delivered.getTime() - sent.getTime();
      return `${Math.round(diffMs / 1000)}s`;
    }
    return null;
  };

  const statusCounts = {
    all: notifications.length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    sent: notifications.filter(n => n.status === 'sent').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Notification History</h2>
          <p className="text-muted-foreground">
            Track and manage lab result notifications sent to patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{statusCounts.all}</p>
              </div>
              <Bell className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-success">{statusCounts.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-primary">{statusCounts.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-destructive">{statusCounts.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{statusCounts.pending + statusCounts.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, test, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {notification.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{notification.patientName}</p>
                        <p className="text-sm text-muted-foreground">{notification.patientId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{notification.testName}</p>
                    {notification.batchId && (
                      <p className="text-sm text-muted-foreground">Batch: {notification.batchId}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      <Badge variant={getStatusBadgeVariant(notification.status)}>
                        {notification.status}
                      </Badge>
                    </div>
                    {notification.errorMessage && (
                      <p className="text-xs text-destructive mt-1">{notification.errorMessage}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(notification.sentAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {notification.deliveredAt ? (
                      <div>
                        <p>{formatDateTime(notification.deliveredAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDeliveryTime(notification)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {notification.retryCount > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {notification.retryCount} retries
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Message
                        </DropdownMenuItem>
                        {notification.status === 'failed' && (
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Send
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          View Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};