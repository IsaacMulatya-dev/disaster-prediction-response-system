import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              if (mounted) {
                setProfile(profileData);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              // Create a default profile if none exists
              if (mounted) {
                setProfile({
                  id: session.user.id,
                  user_id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session with timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        if (mounted) {
          console.log('Session check timeout');
          setLoading(false);
        }
        resolve(null);
      }, 2000);
    });

    Promise.race([sessionPromise, timeoutPromise]).then((result) => {
      if (!mounted) return;
      
      if (result && 'data' in result) {
        const { data: { session } } = result as any;
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((error) => {
      if (mounted) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!session
  };
}