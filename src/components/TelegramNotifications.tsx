import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, Clock, CheckCircle, XCircle, Phone } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  telegram_connected: boolean;
  telegram_username?: string;
}

interface Test {
  id: string;
  test_name: string;
  test_type: string;
  status: string;
  patient_id: string;
  result_summary?: string;
}

interface Notification {
  id: string;
  patient_id: string;
  test_id?: string;
  notification_type: string;
  message: string;
  status: string;
  created_at: string;
  sent_at?: string;
  error_message?: string;
  patients: {
    full_name: string;
    phone: string;
    telegram_connected: boolean;
  };
}

export default function TelegramNotifications() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [notificationType, setNotificationType] = useState<string>('test_result');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
    loadTests();
    loadNotifications();
  }, []);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name');
    
    if (error) {
      console.error('Error loading patients:', error);
      return;
    }
    
    setPatients(data || []);
  };

  const loadTests = async () => {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading tests:', error);
      return;
    }
    
    setTests(data || []);
  };

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        patients (
          full_name,
          phone,
          telegram_connected
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }
    
    setNotifications(data || []);
  };

  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '251' + cleaned.substring(1);
    }
    
    if (!cleaned.startsWith('251')) {
      cleaned = '251' + cleaned;
    }
    
    return '+' + cleaned;
  };

  const generateTestResultMessage = (test: Test, patient: Patient): string => {
    return `📋 *Lab Test Results Available*

Dear ${patient.full_name},

Your ${test.test_name} results are now ready.

*Test Details:*
- Test Type: ${test.test_type}
- Status: ${test.status}
${test.result_summary ? `- Summary: ${test.result_summary}` : ''}

Please visit the hospital to collect your detailed results or consult with your doctor.

*Next Steps:*
1. Visit the lab department during working hours (8:00 AM - 5:00 PM)
2. Bring your ID and test reference number
3. Consult with your doctor about the results`;
  };

  const handleSendNotification = async () => {
    if (!selectedPatient || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a patient and enter a message.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          patient_id: selectedPatient,
          test_id: selectedTest || undefined,
          message: message.trim(),
          notification_type: notificationType
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Notification Sent",
          description: `Message sent successfully to ${data.patient_name}`,
        });
        
        // Clear form
        setSelectedPatient('');
        setSelectedTest('');
        setMessage('');
        
        // Reload notifications
        loadNotifications();
      } else {
        toast({
          title: "Failed to Send",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTestResult = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    const patient = patients.find(p => p.id === test?.patient_id);
    
    if (!test || !patient) return;

    setSelectedPatient(patient.id);
    setSelectedTest(test.id);
    setNotificationType('test_result');
    setMessage(generateTestResultMessage(test, patient));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-500">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  const availableTests = tests.filter(t => t.patient_id === selectedPatient);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Telegram Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <span>{patient.full_name}</span>
                        <Phone className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {normalizePhoneNumber(patient.phone)}
                        </span>
                        {patient.telegram_connected ? (
                          <Badge variant="default" className="text-xs">Connected</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Not Connected</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatientData && !selectedPatientData.telegram_connected && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ This patient is not connected to Telegram. Notification will fail.
                </p>
              )}
            </div>

            {availableTests.length > 0 && (
              <div>
                <label className="text-sm font-medium">Related Test (Optional)</label>
                <Select value={selectedTest} onValueChange={setSelectedTest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific test</SelectItem>
                    {availableTests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.test_name} - {test.test_type} ({test.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Notification Type</label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test_result">Test Result</SelectItem>
                  <SelectItem value="appointment">Appointment Reminder</SelectItem>
                  <SelectItem value="general">General Information</SelectItem>
                  <SelectItem value="urgent">Urgent Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <Button 
              onClick={handleSendNotification} 
              disabled={isLoading || !selectedPatient || !message.trim()}
              className="w-full"
            >
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions for Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test Result Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tests.filter(t => t.status === 'completed').map((test) => {
                const patient = patients.find(p => p.id === test.patient_id);
                if (!patient) return null;
                
                return (
                  <div key={test.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.test_name} - {test.test_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {normalizePhoneNumber(patient.phone)}
                        {patient.telegram_connected ? (
                          <Badge variant="default" className="ml-2 text-xs">Connected</Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2 text-xs">Not Connected</Badge>
                        )}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleQuickTestResult(test.id)}
                      disabled={!patient.telegram_connected}
                    >
                      Notify
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 border rounded">
                <div className="mt-1">
                  {getStatusIcon(notification.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{notification.patients?.full_name}</p>
                    {getStatusBadge(notification.status)}
                    <Badge variant="outline" className="text-xs">
                      {notification.notification_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                    <span>
                      {normalizePhoneNumber(notification.patients?.phone || '')}
                    </span>
                    {notification.error_message && (
                      <span className="text-red-500">Error: {notification.error_message}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}