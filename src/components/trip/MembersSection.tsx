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
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-medium text-foreground">Trip members</p>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors">
            <Plus className="w-3 h-3" /> Invite
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-secondary rounded-lg p-3 mb-3 overflow-hidden">
              <div className="flex gap-2 mb-2 flex-wrap">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="flex-1 min-w-[120px] px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="flex-1 min-w-[120px] px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <select value={role} onChange={e => setRole(e.target.value)} className="px-2.5 py-1.5 text-xs bg-card border border-input rounded-md text-foreground">
                  <option value="member">Member</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">Add</button>
                <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-medium bg-card border border-input rounded-md hover:bg-muted text-foreground">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {members.map(m => (
          <div key={m.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium text-primary-foreground" style={{ background: m.color }}>
              {m.initials}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-foreground">{m.name}</p>
              {m.email && <p className="text-[11px] text-muted-foreground">{m.email}</p>}
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
              ${m.role === 'owner' ? 'bg-blue-50 text-blue-700' : 'bg-secondary text-muted-foreground'}`}>
              {m.role}
            </span>
          </div>
        ))}
        {members.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No members yet</p>}
      </div>
    </motion.div>
  );
}
