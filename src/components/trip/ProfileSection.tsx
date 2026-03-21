import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsSavingSecurity(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      toast.success('Password updated successfully');
      setPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      
      {/* Personal Information */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Personal Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-input rounded-md text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Email address cannot be changed currently.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpdateProfile}
              disabled={isSavingProfile || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-foreground"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Must be at least 6 characters long.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpdatePassword}
              disabled={isSavingSecurity || !password}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            >
              {isSavingSecurity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}