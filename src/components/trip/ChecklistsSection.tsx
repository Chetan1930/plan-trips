import { useState } from 'react';
import { Check, Plus, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ChecklistItem } from '@/lib/types';
import { useCreateChecklistItem, useToggleChecklistItem } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';

interface Props { tripId: string; checklist: ChecklistItem[]; packing: ChecklistItem[]; }

export default function ChecklistsSection({ tripId, checklist, packing }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <ChecklistCard title="Pre-trip checklist" listType="checklist" tripId={tripId} items={checklist} />
      <ChecklistCard title="Packing list" listType="packing" tripId={tripId} items={packing} />
    </motion.div>
  );
}

function ChecklistCard({ title, listType, tripId, items }: { title: string; listType: string; tripId: string; items: ChecklistItem[] }) {
  const [newItem, setNewItem] = useState('');
  const createItem = useCreateChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const { user } = useAuth();
  const done = items.filter(i => i.is_done).length;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const addedBy = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Unknown';
    createItem.mutate({ 
      trip_id: tripId, 
      text: newItem.trim(), 
      list_type: listType,
      added_by: addedBy
    });
    setNewItem('');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        <span className="text-[11px] text-muted-foreground">{done} of {items.length} done</span>
      </div>
      {items.map(item => (
        <div key={item.id} className="flex flex-col gap-1.5 py-2.5 border-b border-border last:border-0">
          <div className="flex items-start gap-2.5">
            <button
              onClick={() => toggleItem.mutate({ id: item.id, is_done: !item.is_done })}
              className={`w-4 h-4 mt-0.5 rounded shrink-0 border flex items-center justify-center transition-colors
                ${item.is_done ? 'bg-primary border-primary' : 'border-input hover:border-primary/50'}`}
            >
              {item.is_done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
            </button>
            <div className="flex-1">
              <span className={`text-[13px] block ${item.is_done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.text}
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                {item.added_by && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded-sm">
                    <User className="w-2.5 h-2.5" />
                    <span>Added by {item.added_by}</span>
                  </div>
                )}
                {item.assigned_to && (
                  <span className="text-[10px] bg-secondary text-muted-foreground rounded-sm px-1.5 py-0.5">
                    Assigned to: {item.assigned_to}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-2 mt-3">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add new item..."
          className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
        />
        <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
    </div>
  );
}