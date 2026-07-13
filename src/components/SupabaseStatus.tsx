import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'unknown'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMessage('');
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('alerts')
        .select('count')
        .limit(1);
      
      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
      } else {
        setStatus('connected');
        setErrorMessage('');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Connection failed');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Supabase Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status:</span>
          <Badge className={getStatusColor()}>
            {status.toUpperCase()}
          </Badge>
        </div>
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
        )}
        
        {lastChecked && (
          <p className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
        
        <Button 
          onClick={checkConnection} 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={status === 'checking'}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${status === 'checking' ? 'animate-spin' : ''}`} />
          Test Connection
        </Button>
        
        {status === 'error' && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Possible solutions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check internet connection</li>
              <li>Verify Supabase project is active</li>
              <li>Check if project URL has changed</li>
              <li>Contact Supabase support if issue persists</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
