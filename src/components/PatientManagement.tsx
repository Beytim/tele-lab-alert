import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users, 
  Search, 
  Plus, 
  MoreVertical,
  MessageSquare,
  UserCheck,
  UserX,
  Phone,
  Mail
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegramId?: string;
  telegramUsername?: string;
  status: 'active' | 'inactive' | 'pending';
  lastResult: string;
  totalResults: number;
  registeredDate: string;
}

export const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock patient data
  const [patients] = useState<Patient[]>([
    {
      id: "P001",
      name: "John Smith",
      phone: "+1234567890",
      email: "john.smith@email.com",
      telegramId: "123456789",
      telegramUsername: "@johnsmith",
      status: "active",
      lastResult: "2024-01-20",
      totalResults: 15,
      registeredDate: "2023-06-15"
    },
    {
      id: "P002",
      name: "Sarah Johnson",
      phone: "+1234567891",
      email: "sarah.j@email.com",
      telegramId: "987654321",
      telegramUsername: "@sarahj",
      status: "active",
      lastResult: "2024-01-18",
      totalResults: 8,
      registeredDate: "2023-08-22"
    },
    {
      id: "P003",
      name: "Mike Davis",
      phone: "+1234567892",
      status: "pending",
      lastResult: "2024-01-15",
      totalResults: 3,
      registeredDate: "2024-01-10"
    },
    {
      id: "P004",
      name: "Emily Brown",
      phone: "+1234567893",
      email: "emily.brown@email.com",
      telegramId: "456789123",
      telegramUsername: "@emilybrown",
      status: "inactive",
      lastResult: "2023-12-20",
      totalResults: 22,
      registeredDate: "2023-03-10"
    }
  ]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: Patient['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Patient['status']) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4 text-success" />;
      case 'inactive': return <UserX className="h-4 w-4 text-muted-foreground" />;
      case 'pending': return <MessageSquare className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Patient Management</h2>
          <p className="text-muted-foreground">
            Manage patient records and Telegram account connections
          </p>
        </div>
        <Button className="shadow-soft">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3 shadow-soft">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-success">Connected:</span>
              <span className="font-medium">{patients.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warning">Pending:</span>
              <span className="font-medium">{patients.filter(p => p.status === 'pending').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-medium">{patients.filter(p => p.status === 'inactive').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Patients ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Result</TableHead>
                <TableHead>Total Results</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.telegramUsername ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{patient.telegramUsername}</p>
                        <p className="text-xs text-muted-foreground">ID: {patient.telegramId}</p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">Not connected</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(patient.status)}
                      <Badge variant={getStatusBadgeVariant(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {patient.lastResult}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {patient.totalResults}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                        <DropdownMenuItem>Send Test Message</DropdownMenuItem>
                        {patient.status === 'pending' && (
                          <DropdownMenuItem>Retry Connection</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          Remove Patient
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

      {/* Connection Instructions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Automatic Patient Matching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">How it works</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• System matches patients by phone number</li>
                <li>• Patients start conversation with bot using /start</li>
                <li>• Bot verifies identity using phone or patient ID</li>
                <li>• Automatic connection established</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Patient Instructions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Send message to @YourLabBot on Telegram</li>
                <li>• Use command: /start phone_number</li>
                <li>• Example: /start +1234567890</li>
                <li>• Bot will confirm connection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};