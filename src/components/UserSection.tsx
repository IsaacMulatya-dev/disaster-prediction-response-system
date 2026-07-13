import React, { useState } from 'react';
import { User, LogOut, ChevronDown, Shield, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export function UserSection() {
  const { profile, user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Use profile data if available, otherwise fall back to user data
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Emergency Response User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'Emergency Response Administrator';

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <User className="h-4 w-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'operator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 p-2 h-auto hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} alt={displayName} />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="hidden md:flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(displayRole)}`}
              >
                {displayRole}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {displayEmail}
            </span>
          </div>
          
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="text-sm font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {displayName}
                </span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(displayRole)}`}
                >
                  {displayRole}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {displayEmail}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="p-4 space-y-3">
          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium text-foreground">
                {displayRole}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">
                {displayEmail}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">
                +254 700 000 000
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <DropdownMenuItem 
            className="flex items-center gap-2 p-3 cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
