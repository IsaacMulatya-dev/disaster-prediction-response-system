import { useState, useEffect } from 'react';
import { Settings, Save, Bell, Globe, Shield, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  alert_threshold: 'low' | 'medium' | 'high';
  location_radius: number;
  preferred_language: string;
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    alert_threshold: 'medium',
    location_radius: 50,
    preferred_language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile?.user_id) return;
    fetchSettings();
  }, [profile?.user_id]);

  const fetchSettings = async () => {
    if (!profile?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          email_notifications: data.email_notifications,
          sms_notifications: data.sms_notifications,
          push_notifications: data.push_notifications,
          alert_threshold: data.alert_threshold,
          location_radius: data.location_radius,
          preferred_language: data.preferred_language,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!profile?.user_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.user_id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-medium">Notification Preferences</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch
                id="sms-notifications"
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.push_notifications}
                onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Alert Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <h3 className="font-medium">Alert Settings</h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="alert-threshold">Alert Threshold</Label>
              <Select
                value={settings.alert_threshold}
                onValueChange={(value) => updateSetting('alert_threshold', value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - All alerts</SelectItem>
                  <SelectItem value="medium">Medium - Important alerts</SelectItem>
                  <SelectItem value="high">High - Critical alerts only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location-radius">Location Radius (km)</Label>
              <Input
                id="location-radius"
                type="number"
                value={settings.location_radius}
                onChange={(e) => updateSetting('location_radius', parseInt(e.target.value) || 50)}
                min="1"
                max="500"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Language Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <h3 className="font-medium">Language & Region</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select
              value={settings.preferred_language}
              onValueChange={(value) => updateSetting('preferred_language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <Button onClick={saveSettings} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}