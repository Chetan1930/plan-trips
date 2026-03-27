import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProfileSection from '@/components/trip/ProfileSection';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="bg-card border-b border-border px-4 md:px-6 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[15px] font-medium text-foreground">Your Profile</span>
        </div>
        <ThemeToggle />
      </div>
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <ProfileSection />
      </div>
    </div>
  );
}
