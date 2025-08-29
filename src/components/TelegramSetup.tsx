import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ExternalLink,
  MessageCircle,
  Phone
} from 'lucide-react';

export default function TelegramSetup() {
  const [botToken, setBotToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [connectedPatients, setConnectedPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConnectedPatients();
    setWebhookUrl(`https://iehrgkujambjgmbjhdhy.supabase.co/functions/v1/telegram-webhook`);
  }, []);

  const loadConnectedPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('telegram_connected', true);
    
    if (!error && data) {
      setConnectedPatients(data.length);
    }
  };

  const testBotConnection = async () => {
    if (!botToken.trim()) {
      toast({
        title: "Missing Bot Token",
        description: "Please enter your Telegram bot token first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        setBotInfo(data.result);
        toast({
          title: "Bot Connected",
          description: `Successfully connected to bot: @${data.result.username}`,
        });
      } else {
        throw new Error(data.description || 'Invalid bot token');
      }
    } catch (error) {
      console.error('Bot test error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to bot",
        variant: "destructive",
      });
      setBotInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebhook = async () => {
    if (!botToken.trim()) {
      toast({
        title: "Missing Bot Token",
        description: "Please enter your bot token first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast({
          title: "Webhook Set",
          description: "Telegram webhook has been configured successfully.",
        });
      } else {
        throw new Error(data.description || 'Failed to set webhook');
      }
    } catch (error) {
      console.error('Webhook setup error:', error);
      toast({
        title: "Webhook Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Bot Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Telegram Bot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Bot Token</label>
            <div className="flex gap-2 mt-1">
              <Input
                type="password"
                placeholder="Enter your Telegram bot token"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
              <Button onClick={testBotConnection} disabled={isLoading} variant="outline">
                {isLoading ? "Testing..." : "Test"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Get your bot token from @BotFather on Telegram
            </p>
          </div>

          {botInfo && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Bot Connected</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                <strong>@{botInfo.username}</strong> - {botInfo.first_name}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Webhook URL</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={webhookUrl}
                readOnly
                className="bg-muted"
              />
              <Button 
                onClick={() => copyToClipboard(webhookUrl)} 
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={setupWebhook} disabled={isLoading || !botToken}>
                {isLoading ? "Setting up..." : "Setup Webhook"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Create a Telegram Bot</h4>
                <p className="text-sm text-muted-foreground">
                  Message @BotFather on Telegram and use /newbot to create your bot
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Get Your Bot Token</h4>
                <p className="text-sm text-muted-foreground">
                  Copy the bot token provided by @BotFather and paste it above
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Configure Webhook</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Setup Webhook" to connect your bot to the hospital system
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Patient Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Patients can connect by messaging your bot with: /start +their_phone_number
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{connectedPatients}</p>
                <p className="text-xs text-muted-foreground">Connected Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {botInfo ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Bot Active</p>
                    <p className="text-xs text-muted-foreground">@{botInfo.username}</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Bot Not Connected</p>
                    <p className="text-xs text-muted-foreground">Configure token</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ready to Send</p>
                <p className="text-xs text-muted-foreground">Notifications active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Links */}
      <Card>
        <CardHeader>
          <CardTitle>Help & Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <a
              href="https://core.telegram.org/bots#creating-a-new-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              How to create a Telegram bot
            </a>
            <a
              href="https://core.telegram.org/bots/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Telegram Bot API Documentation
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}