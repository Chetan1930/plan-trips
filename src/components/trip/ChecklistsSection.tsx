import { useState } from 'react';
import { Check, Plus, User, ListTodo, Navigation, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { ChecklistItem } from '@/lib/types';
import { useCreateChecklistItem, useToggleChecklistItem } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';

interface Props { tripId: string; checklist: ChecklistItem[]; packing: ChecklistItem[]; }

export default function ChecklistsSection({ tripId, checklist, packing }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Checklists</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Keep track of tasks and packing essentials so you don't forget a thing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChecklistCard 
          icon={ListTodo} 
          title="Pre-trip Tasks" 
          subtitle="Bookings, visas, and prep"
          listType="checklist" 
          tripId={tripId} 
          items={checklist} 
          colorClass="bg-blue-500" 
        />
        <ChecklistCard 
          icon={Navigation} 
          title="Packing List" 
          subtitle="Don't forget the essentials"
          listType="packing" 
          tripId={tripId} 
          items={packing} 
          colorClass="bg-primary" 
        />
      </div>
    </motion.div>
  );
}

function ChecklistCard({ icon: Icon, title, subtitle, listType, tripId, items, colorClass }: { icon: LucideIcon; title: string; subtitle: string; listType: string; tripId: string; items: ChecklistItem[]; colorClass: string }) {
  const [newItem, setNewItem] = useState('');
  const createItem = useCreateChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const { user } = useAuth();
  
  const done = items.filter(i => i.is_done).length;
  const percentage = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
  const isComplete = items.length > 0 && percentage === 100;

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
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to add item')
      }
    );
  };

  const handleToggle = (item: ChecklistItem) => {
    toggleItem.mutate(
      { id: item.id, is_done: !item.is_done },
      {
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to update item')
      }
    );
  };

  return (
    <div className={`bg-card border ${isComplete ? 'border-primary/50 shadow-primary/10' : 'border-border'} rounded-3xl p-6 shadow-sm flex flex-col h-[70vh] sm:h-[60vh] transition-colors relative overflow-hidden`}>
      
      {/* Celebration background if 100% */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}

      {/* Header & Progress */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isComplete ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary border-border text-foreground'} transition-colors`}>
              {isComplete ? <Sparkles className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">{title}</h3>
              <p className="text-xs font-bold text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          <span className={`text-3xl font-black tabular-nums ${isComplete ? 'text-primary' : 'text-foreground'}`}>{percentage}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden border border-border/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, type: "spring" }}
            className={`h-full ${colorClass} rounded-full relative`}
          >
            {isComplete && <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]" />}
          </motion.div>
        </div>
        <p className={`text-right text-[10px] font-bold mt-2 uppercase tracking-wider ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
          {isComplete ? 'All tasks complete! Awesome job.' : `${done} of ${items.length} completed`}
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6 relative z-10">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`Add new ${listType === 'packing' ? 'item to pack' : 'task'}...`}
          className="flex-1 px-5 py-3 text-sm font-medium bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
        />
        <button 
          onClick={handleAdd} 
          disabled={createItem.isPending || !newItem.trim()}
          className="w-12 h-12 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-sm shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 relative z-10 scrollbar-thin">
        <AnimatePresence>
          {items.map(item => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${item.is_done ? 'bg-secondary/40 border-transparent opacity-60 hover:opacity-100' : 'bg-background border-border hover:border-primary/40 shadow-sm hover:shadow-md'}`}
              onClick={() => handleToggle(item)}
            >
              <div className={`w-6 h-6 mt-0.5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
                ${item.is_done ? 'bg-primary border-primary text-primary-foreground scale-110' : 'border-muted-foreground/30 group-hover:border-primary text-transparent'}`}
              >
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-base block break-words transition-all ${item.is_done ? 'line-through text-muted-foreground font-semibold' : 'text-foreground font-bold'}`}>
                  {item.text}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.added_by && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider bg-background px-2 py-1 rounded-md border border-border">
                      <User className="w-3 h-3" />
                      <span>Added by {item.added_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground h-full">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Icon className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-lg font-bold text-foreground">List is empty</p>
            <p className="text-sm font-medium mt-1 max-w-[200px]">
              {listType === 'packing' ? 'e.g., Passports, Sunscreen, Phone Charger' : 'e.g., Book flights, Buy travel insurance'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}