import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Shield, 
  Search, 
  Download, 
  User,
  FileText,
  Settings,
  Send,
  AlertTriangle
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'warning';
}

export const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  // Mock audit data
  const auditEntries: AuditEntry[] = [
    {
      id: "A001",
      timestamp: "2024-01-20T10:30:00Z",
      user: "admin@girumhospital.com",
      action: "FILE_UPLOAD",
      resource: "lab_results_batch_001.xlsx",
      details: "Uploaded lab results file containing 45 patient records",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
      status: "success"
    },
    {
      id: "A002",
      timestamp: "2024-01-20T10:25:00Z",
      user: "lab.tech@girumhospital.com",
      action: "NOTIFICATION_SENT",
      resource: "Patient P001",
      details: "CBC results notification sent via Telegram",
      ipAddress: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "low",
      status: "success"
    },
    {
      id: "A003",
      timestamp: "2024-01-20T10:20:00Z",
      user: "system",
      action: "LOGIN_FAILED",
      resource: "Authentication System",
      details: "Failed login attempt for user: unknown@test.com",
      ipAddress: "203.0.113.1",
      userAgent: "curl/7.68.0",
      severity: "high",
      status: "failed"
    },
    {
      id: "A004",
      timestamp: "2024-01-20T10:15:00Z",
      user: "admin@girumhospital.com",
      action: "CONFIG_CHANGE",
      resource: "Bot Configuration",
      details: "Updated message template for lab notifications",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
      status: "success"
    },
    {
      id: "A005",
      timestamp: "2024-01-20T10:10:00Z",
      user: "radiology@girumhospital.com",
      action: "PATIENT_ACCESS",
      resource: "Patient P002",
      details: "Accessed patient records for X-ray result notification",
      ipAddress: "192.168.1.110",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      severity: "low",
      status: "success"
    }
  ];

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = 
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter;
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'FILE_UPLOAD': return <FileText className="h-4 w-4" />;
      case 'NOTIFICATION_SENT': return <Send className="h-4 w-4" />;
      case 'LOGIN_FAILED': return <AlertTriangle className="h-4 w-4" />;
      case 'CONFIG_CHANGE': return <Settings className="h-4 w-4" />;
      case 'PATIENT_ACCESS': return <User className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'destructive' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default' as const;
      case 'failed': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Audit Log</h2>
          <p className="text-muted-foreground">
            Track all system activities and security events for compliance
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="FILE_UPLOAD">File Upload</SelectItem>
                <SelectItem value="NOTIFICATION_SENT">Notification</SelectItem>
                <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                <SelectItem value="CONFIG_CHANGE">Config Change</SelectItem>
                <SelectItem value="PATIENT_ACCESS">Patient Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Events ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{entry.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(entry.action)}
                      <span className="text-sm">{entry.action.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">
                    {entry.resource}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityVariant(entry.severity)}>
                      {entry.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(entry.status)}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.ipAddress}
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