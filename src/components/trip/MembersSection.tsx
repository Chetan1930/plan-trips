import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TripMember } from '@/lib/types';
import { useCreateTripMember } from '@/hooks/useTripData';

interface Props { tripId: string; members: TripMember[]; }

const memberColors = ['#5DCAA5', '#AFA9EC', '#F0997B', '#78B4E8', '#E8C478'];

export default function MembersSection({ tripId, members }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const createMember = useCreateTripMember();

  const handleAdd = () => {
    if (!name.trim()) return;
    const color = memberColors[members.length % memberColors.length];
    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    createMember.mutate({ trip_id: tripId, name: name.trim(), email: email || undefined, role, initials, color });
    setName(''); setEmail(''); setRole('member'); setShowForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-foreground">Trip members</p>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors">
            <Plus className="w-3.5 h-3.5" /> Invite
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-secondary/60 border border-border/50 rounded-lg p-3 sm:p-4 mb-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full sm:flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full sm:flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full sm:w-auto px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="member">Member</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">Send Invite</button>
                <button onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-card border border-input rounded-md hover:bg-muted text-foreground">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[11px] font-semibold text-primary-foreground shrink-0 shadow-sm" style={{ background: m.color }}>
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-[13px] font-medium text-foreground truncate">{m.name}</p>
                {m.email && <p className="text-xs sm:text-[11px] text-muted-foreground truncate">{m.email}</p>}
              </div>
              <span className={`text-[10px] font-medium px-2 py-1 rounded-md shrink-0 border
                ${m.role === 'owner' ? 'bg-blue-50/50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' : 'bg-secondary border-border text-muted-foreground'}`}>
                {m.role}
              </span>
            </div>
          ))}
          {members.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No members yet</p>}
        </div>
      </div>
    </motion.div>
  );
}