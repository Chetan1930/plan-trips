import { useState } from 'react';
import { Check, Plus, User, ListTodo, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { ChecklistItem } from '@/lib/types';
import { useCreateChecklistItem, useToggleChecklistItem } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';

interface Props { tripId: string; checklist: ChecklistItem[]; packing: ChecklistItem[]; }

export default function ChecklistsSection({ tripId, checklist, packing }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-foreground">Checklists</h2>
          <p className="text-sm text-muted-foreground">Stay organized before you go</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChecklistCard 
          icon={ListTodo} 
          title="Pre-trip Tasks" 
          listType="checklist" 
          tripId={tripId} 
          items={checklist} 
          colorClass="bg-blue-500" 
        />
        <ChecklistCard 
          icon={Navigation} 
          title="Packing List" 
          listType="packing" 
          tripId={tripId} 
          items={packing} 
          colorClass="bg-primary" 
        />
      </div>
    </motion.div>
  );
}

function ChecklistCard({ icon: Icon, title, listType, tripId, items, colorClass }: { icon: any; title: string; listType: string; tripId: string; items: ChecklistItem[]; colorClass: string }) {
  const [newItem, setNewItem] = useState('');
  const createItem = useCreateChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const { user } = useAuth();
  const done = items.filter(i => i.is_done).length;
  const percentage = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const addedBy = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Unknown';
    createItem.mutate(
      { 
        trip_id: tripId, 
        text: newItem.trim(), 
        list_type: listType,
        added_by: addedBy
      },
      {
        onSuccess: () => setNewItem(''),
        onError: (err: any) => toast.error(err.message || 'Failed to add item')
      }
    );
  };

  const handleToggle = (item: ChecklistItem) => {
    toggleItem.mutate(
      { id: item.id, is_done: !item.is_done },
      {
        onError: (err: any) => toast.error(err.message || 'Failed to update item')
      }
    );
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col h-full">
      {/* Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
          <span className="text-2xl font-black text-foreground tabular-nums">{percentage}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${colorClass} rounded-full`}
          />
        </div>
        <p className="text-right text-[11px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">{done} of {items.length} tasks</p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add new item..."
          className="flex-1 px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
        />
        <button 
          onClick={handleAdd} 
          disabled={createItem.isPending || !newItem.trim()}
          className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        <AnimatePresence>
          {items.map(item => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${item.is_done ? 'bg-secondary/30 border-transparent opacity-60 hover:opacity-100' : 'bg-background border-border hover:border-primary/40 shadow-sm'}`}
              onClick={() => handleToggle(item)}
            >
              <div className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors
                ${item.is_done ? 'bg-primary border-primary text-primary-foreground' : 'border-input group-hover:border-primary text-transparent'}`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block break-words transition-all ${item.is_done ? 'line-through text-muted-foreground font-medium' : 'text-foreground font-semibold'}`}>
                  {item.text}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.added_by && (
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      <User className="w-2.5 h-2.5" />
                      <span>Added by {item.added_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <ListTodo className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">Nothing here yet</p>
          </div>
        )}
      </div>
    </div>
  );
}