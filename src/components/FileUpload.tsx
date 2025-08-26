import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  X,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  recordsFound?: number;
  recordsProcessed?: number;
  errors?: string[];
}

export const FileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => 
      file.type.includes('excel') || 
      file.type.includes('spreadsheet') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );

    if (validFiles.length !== fileList.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload Excel (.xlsx, .xls) or CSV files only.",
        variant: "destructive",
      });
    }

    validFiles.forEach(file => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };

      setFiles(prev => [...prev, newFile]);
      simulateFileProcessing(newFile.id);
    });
  };

  const simulateFileProcessing = (fileId: string) => {
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId && file.status === 'uploading') {
          const newProgress = Math.min(file.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            setTimeout(() => startProcessing(fileId), 500);
            return { ...file, progress: 100, status: 'processing' };
          }
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 300);
  };

  const startProcessing = (fileId: string) => {
    // Simulate processing
    setTimeout(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const recordsFound = Math.floor(Math.random() * 100) + 20;
          const recordsProcessed = Math.floor(recordsFound * 0.95);
          const hasErrors = Math.random() < 0.2;
          
          return {
            ...file,
            status: hasErrors ? 'error' : 'completed',
            recordsFound,
            recordsProcessed,
            errors: hasErrors ? ['Invalid patient ID format in row 15', 'Missing test results in row 23'] : undefined
          };
        }
        return file;
      }));

      toast({
        title: "File processed",
        description: "Lab results have been processed and queued for notification.",
      });
    }, 2000);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-warning';
      case 'completed':
        return 'bg-success';
      case 'error':
        return 'bg-destructive';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Upload Lab Results</h2>
          <p className="text-muted-foreground">
            Upload Excel files from MedAx or CSV files containing lab results
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="shadow-medium">
        <CardContent className="p-6">
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-accent' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Drop files here</h3>
                <p className="text-sm text-muted-foreground">
                  Or click to select Excel (.xlsx, .xls) or CSV files
                </p>
              </div>
              <Button 
                onClick={() => document.getElementById('file-input')?.click()}
                className="shadow-soft"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Select Files
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Processing Status */}
      {files.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{file.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {file.status}
                      </p>
                      
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                      
                      {file.recordsFound && (
                        <div className="mt-2 flex gap-4 text-sm">
                          <span>Records found: <strong>{file.recordsFound}</strong></span>
                          <span>Processed: <strong>{file.recordsProcessed}</strong></span>
                        </div>
                      )}
                      
                      {file.errors && file.errors.length > 0 && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium">Processing errors:</p>
                              {file.errors.map((error, index) => (
                                <p key={index} className="text-sm">• {error}</p>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`ml-3 ${getStatusColor(file.status)}`}
                  >
                    {file.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">File Format Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Required Columns</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Patient ID or Name</li>
                <li>• Phone Number (with country code)</li>
                <li>• Test Name</li>
                <li>• Test Results</li>
                <li>• Reference Range (optional)</li>
                <li>• Test Date</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Excel files (.xlsx, .xls)</li>
                <li>• CSV files (.csv)</li>
                <li>• MedAx export format</li>
                <li>• Custom laboratory formats</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};