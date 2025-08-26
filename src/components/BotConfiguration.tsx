import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Bot, 
  Settings, 
  MessageSquare, 
  Clock, 
  Shield,
  TestTube,
  Save,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotConfig {
  botToken: string;
  botUsername: string;
  webhookUrl: string;
  isActive: boolean;
  messageTemplate: string;
  batchingEnabled: boolean;
  batchTimeWindow: number;
  maxRetriesCount: number;
  retryDelay: number;
  workingHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  allowedCommands: string[];
  adminUsers: string[];
}

export const BotConfiguration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [config, setConfig] = useState<BotConfig>({
    botToken: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
    botUsername: "@YourLabBot",
    webhookUrl: "https://your-domain.com/webhook",
    isActive: true,
    messageTemplate: `🔬 *Lab Results Ready*

Hello {{patientName}},

Your {{testName}} results are now available:

{{results}}

{{#hasAbnormalValues}}
⚠️ Some values require attention. Please consult with your healthcare provider.
{{/hasAbnormalValues}}

{{#hasNormalValues}}
✅ All values are within normal range.
{{/hasNormalValues}}

If you have any questions, please contact us.

Best regards,
Lab Team`,
    batchingEnabled: true,
    batchTimeWindow: 30,
    maxRetriesCount: 3,
    retryDelay: 300,
    workingHours: {
      enabled: true,
      startTime: "08:00",
      endTime: "18:00"
    },
    allowedCommands: ["/start", "/help", "/status", "/stop"],
    adminUsers: ["@admin1", "@admin2"]
  });

  const [botStatus, setBotStatus] = useState({
    connected: true,
    lastPing: "2024-01-20T10:30:00Z",
    messagesSent: 1247,
    uptime: "5 days, 12 hours"
  });

  const handleSaveConfig = () => {
    // In a real app, this would save to your backend
    toast({
      title: "Configuration saved",
      description: "Bot configuration has been updated successfully.",
    });
  };

  const handleTestBot = () => {
    // In a real app, this would send a test message
    toast({
      title: "Test message sent",
      description: "A test notification has been sent to admin users.",
    });
  };

  const updateConfig = (updates: Partial<BotConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Bot Configuration</h2>
          <p className="text-muted-foreground">
            Configure your Telegram bot settings and notification preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestBot}>
            <TestTube className="mr-2 h-4 w-4" />
            Test Bot
          </Button>
          <Button onClick={handleSaveConfig} className="shadow-soft">
            <Save className="mr-2 h-4 w-4" />
            Save Config
          </Button>
        </div>
      </div>

      {/* Bot Status */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Bot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${botStatus.connected ? 'bg-success' : 'bg-destructive'}`} />
                <Badge variant={botStatus.connected ? "default" : "destructive"}>
                  {botStatus.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Messages Sent</span>
              <span className="text-sm font-bold">{botStatus.messagesSent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime</span>
              <span className="text-sm font-bold">{botStatus.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Ping</span>
              <span className="text-sm text-muted-foreground">
                {new Date(botStatus.lastPing).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <Input
                    id="botToken"
                    type="password"
                    value={config.botToken}
                    onChange={(e) => updateConfig({ botToken: e.target.value })}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botUsername">Bot Username</Label>
                  <Input
                    id="botUsername"
                    value={config.botUsername}
                    onChange={(e) => updateConfig({ botUsername: e.target.value })}
                    placeholder="@YourLabBot"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={config.webhookUrl}
                  onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Bot Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the bot for sending notifications
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={config.isActive}
                  onCheckedChange={(checked) => updateConfig({ isActive: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              To get a bot token, message @BotFather on Telegram and follow the instructions to create a new bot.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Message Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="messageTemplate">Notification Template</Label>
                <Textarea
                  id="messageTemplate"
                  value={config.messageTemplate}
                  onChange={(e) => updateConfig({ messageTemplate: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Available Variables</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><code>{'{{patientName}}'}</code> - Patient's name</p>
                    <p><code>{'{{testName}}'}</code> - Name of the test</p>
                    <p><code>{'{{results}}'}</code> - Test results</p>
                    <p><code>{'{{referenceRange}}'}</code> - Normal range</p>
                    <p><code>{'{{testDate}}'}</code> - Date of test</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Conditional Blocks</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><code>{'{{#hasAbnormalValues}}...{{/hasAbnormalValues}}'}</code></p>
                    <p><code>{'{{#hasNormalValues}}...{{/hasNormalValues}}'}</code></p>
                    <p><code>{'{{#isUrgent}}...{{/isUrgent}}'}</code></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Scheduling & Batching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="batchingEnabled">Enable Batching</Label>
                  <p className="text-sm text-muted-foreground">
                    Group multiple results for the same patient into a single message
                  </p>
                </div>
                <Switch
                  id="batchingEnabled"
                  checked={config.batchingEnabled}
                  onCheckedChange={(checked) => updateConfig({ batchingEnabled: checked })}
                />
              </div>

              {config.batchingEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="batchTimeWindow">Batch Time Window (minutes)</Label>
                  <Select
                    value={config.batchTimeWindow.toString()}
                    onValueChange={(value) => updateConfig({ batchTimeWindow: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="workingHoursEnabled">Working Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Only send notifications during specified hours
                  </p>
                </div>
                <Switch
                  id="workingHoursEnabled"
                  checked={config.workingHours.enabled}
                  onCheckedChange={(checked) => 
                    updateConfig({ workingHours: { ...config.workingHours, enabled: checked } })
                  }
                />
              </div>

              {config.workingHours.enabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={config.workingHours.startTime}
                      onChange={(e) => 
                        updateConfig({ 
                          workingHours: { ...config.workingHours, startTime: e.target.value } 
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={config.workingHours.endTime}
                      onChange={(e) => 
                        updateConfig({ 
                          workingHours: { ...config.workingHours, endTime: e.target.value } 
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                  <Select
                    value={config.maxRetriesCount.toString()}
                    onValueChange={(value) => updateConfig({ maxRetriesCount: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 retry</SelectItem>
                      <SelectItem value="3">3 retries</SelectItem>
                      <SelectItem value="5">5 retries</SelectItem>
                      <SelectItem value="10">10 retries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">Retry Delay (seconds)</Label>
                  <Select
                    value={config.retryDelay.toString()}
                    onValueChange={(value) => updateConfig({ retryDelay: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="adminUsers">Admin Users</Label>
                <Textarea
                  id="adminUsers"
                  value={config.adminUsers.join('\n')}
                  onChange={(e) => updateConfig({ adminUsers: e.target.value.split('\n').filter(u => u.trim()) })}
                  rows={4}
                  placeholder="@admin1&#10;@admin2&#10;@admin3"
                />
                <p className="text-sm text-muted-foreground">
                  One username per line. These users can manage the bot.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedCommands">Allowed Commands</Label>
                <Textarea
                  id="allowedCommands"
                  value={config.allowedCommands.join('\n')}
                  onChange={(e) => updateConfig({ allowedCommands: e.target.value.split('\n').filter(c => c.trim()) })}
                  rows={4}
                  placeholder="/start&#10;/help&#10;/status&#10;/stop"
                />
                <p className="text-sm text-muted-foreground">
                  Commands that patients can use with the bot.
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Never share your bot token. Store it securely and rotate it regularly. 
              All patient data should be encrypted and handled according to HIPAA compliance requirements.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};