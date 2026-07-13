import { useAuth } from '@/hooks/useAuth';

export function DebugInfo() {
  const auth = useAuth();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {auth.loading ? 'true' : 'false'}</div>
        <div>Authenticated: {auth.isAuthenticated ? 'true' : 'false'}</div>
        <div>User: {auth.user?.email || 'null'}</div>
        <div>Session: {auth.session ? 'exists' : 'null'}</div>
        <div>Profile: {auth.profile?.full_name || 'null'}</div>
      </div>
    </div>
  );
}

