import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Code, 
  Download, 
  Server, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

export const SetupInstructions = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Complete Setup Instructions</h1>
        <p className="text-muted-foreground text-lg">
          Deploy your Telegram Lab Notification System with backend integration
        </p>
      </div>

      {/* Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This dashboard provides the frontend management interface. For full functionality, you'll need to implement 
          the backend components using Supabase Edge Functions or deploy a Node.js/Python service.
        </AlertDescription>
      </Alert>

      {/* Step 1: Telegram Bot Setup */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Step 1: Create Telegram Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <p className="font-medium">Contact @BotFather on Telegram</p>
                <p className="text-sm text-muted-foreground">Start a chat with @BotFather and create a new bot</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <p className="font-medium">Use command: <code>/newbot</code></p>
                <p className="text-sm text-muted-foreground">Follow the prompts to name your bot</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <p className="font-medium">Save your bot token</p>
                <p className="text-sm text-muted-foreground">Format: <code>1234567890:ABCdefGHIjklMNOpqrsTUVwxyz</code></p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Recommended Bot Settings:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <code>/setdescription</code> - "Lab results notification bot"</li>
              <li>• <code>/setabouttext</code> - "Automated lab results delivery"</li>
              <li>• <code>/setcommands</code> - Set up /start, /help, /status commands</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Backend Implementation */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Step 2: Backend Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Option A: Supabase Edge Functions</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Create Supabase project</p>
                <p>2. Set up Edge Functions for:</p>
                <ul className="ml-4 space-y-1">
                  <li>• File processing</li>
                  <li>• Patient matching</li>
                  <li>• Telegram messaging</li>
                  <li>• Webhook handling</li>
                </ul>
                <p>3. Configure environment variables</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Option B: Node.js/Python Service</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Deploy to cloud platform</p>
                <p>2. Required endpoints:</p>
                <ul className="ml-4 space-y-1">
                  <li>• <code>/webhook</code> - Telegram updates</li>
                  <li>• <code>/upload</code> - File processing</li>
                  <li>• <code>/send</code> - Send notifications</li>
                  <li>• <code>/patients</code> - Manage patients</li>
                </ul>
                <p>3. Database setup (PostgreSQL/MongoDB)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: File Processing */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Step 3: File Processing Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Required File Processing Logic:</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`// Example Node.js implementation
const xlsx = require('xlsx');
const multer = require('multer');

app.post('/upload', upload.single('file'), async (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  for (const row of data) {
    const patient = await findPatientByPhone(row.phone);
    if (patient && patient.telegramId) {
      await queueNotification({
        patientId: patient.id,
        testName: row.testName,
        results: row.results,
        telegramId: patient.telegramId
      });
    }
  }
  
  res.json({ processed: data.length });
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Patient Matching */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Step 4: Patient Matching System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Automatic Patient Registration:</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`// Telegram webhook handler
bot.command('start', async (ctx) => {
  const phone = ctx.message.text.split(' ')[1]; // /start +1234567890
  
  if (phone) {
    const patient = await db.patients.findOne({ phone });
    if (patient) {
      await db.patients.updateOne(
        { phone },
        { 
          telegramId: ctx.from.id,
          telegramUsername: ctx.from.username,
          status: 'active'
        }
      );
      ctx.reply('✅ Connected! You will receive lab results here.');
    } else {
      ctx.reply('❌ Phone number not found in our system.');
    }
  } else {
    ctx.reply('Please use: /start +1234567890');
  }
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Security & Compliance */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Step 5: Security & HIPAA Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This system handles sensitive medical data. Ensure HIPAA compliance.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Required Security Measures:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Encrypt all patient data at rest</li>
                <li>• Use HTTPS/TLS for all communications</li>
                <li>• Implement access logging</li>
                <li>• Regular security audits</li>
                <li>• Secure bot token storage</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Environment Variables:</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <div>TELEGRAM_BOT_TOKEN=your_token</div>
                <div>DATABASE_URL=connection_string</div>
                <div>ENCRYPTION_KEY=secure_key</div>
                <div>WEBHOOK_URL=your_webhook_url</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Options */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Deployment Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Supabase + Vercel</h4>
              <p className="text-sm text-muted-foreground">
                Frontend on Vercel, backend Edge Functions on Supabase
              </p>
              <Badge variant="outline" className="text-xs">Recommended</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">AWS/Google Cloud</h4>
              <p className="text-sm text-muted-foreground">
                Full control with serverless functions or containers
              </p>
              <Badge variant="outline" className="text-xs">Enterprise</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">VPS/Dedicated Server</h4>
              <p className="text-sm text-muted-foreground">
                Traditional deployment with full server control
              </p>
              <Badge variant="outline" className="text-xs">On-Premise</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};