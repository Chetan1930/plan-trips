import { MapPin, LayoutGrid, Calendar, CheckSquare, Users, MessageSquare, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { NavSection, Trip } from '@/lib/types';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeNav: NavSection;
  setActiveNav: (n: NavSection) => void;
  trips: Trip[];
  activeTripId: string | undefined;
  setActiveTripId: (id: string) => void;
  onCreateTrip: () => void;
}

const navItems: { key: NavSection; label: string; icon?: typeof LayoutGrid; emoji?: string }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'itinerary', label: 'Itinerary', icon: Calendar },
  { key: 'expenses', label: 'Expenses', emoji: '₹' },
  { key: 'checklists', label: 'Checklists', icon: CheckSquare },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
];

export default function Sidebar({ activeNav, setActiveNav, trips, activeTripId, setActiveTripId, onCreateTrip }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold text-foreground">Wandr</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">Menu</p>
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveNav(key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors mb-0.5
              ${activeNav === key ? 'bg-accent text-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Icon className="w-[15px] h-[15px] shrink-0 opacity-70" />
            {label}
          </button>
        ))}

        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pt-4 pb-1.5">Your Trips</p>
        {trips.map(trip => (
          <button
            key={trip.id}
            onClick={() => setActiveTripId(trip.id)}
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors
              ${activeTripId === trip.id ? 'bg-accent text-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-muted'}`}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: trip.color }} />
            <span className="truncate">{trip.name}</span>
          </button>
        ))}
        <button
          onClick={onCreateTrip}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5"
        >
          <Plus className="w-3 h-3" />
          New trip
        </button>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-medium shrink-0">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{user?.email?.split('@')[0]}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
        </div>
        <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
