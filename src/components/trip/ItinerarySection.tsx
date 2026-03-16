import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Activity } from '@/lib/types';
import { useCreateActivity, useDeleteActivity } from '@/hooks/useTripData';

interface Props {
  tripId: string;
  activities: Activity[];
}

export default function ItinerarySection({ tripId, activities }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const createActivity = useCreateActivity();
  const deleteActivity = useDeleteActivity();

  const grouped = activities.reduce((acc, a) => {
    const key = a.activity_date || 'No date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {} as Record<string, Activity[]>);

  const handleAdd = () => {
    if (!title.trim()) return;
    createActivity.mutate({
      trip_id: tripId,
      title: title.trim(),
      location: location || undefined,
      activity_date: date || undefined,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
    });
    setTitle(''); setLocation(''); setDate(''); setStartTime(''); setEndTime('');
    setShowForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        <Plus className="w-3 h-3" /> Add Activity
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-secondary rounded-lg p-3 overflow-hidden"
          >
            <div className="flex gap-2 mb-2 flex-wrap">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Activity title" className="flex-1 min-w-[140px] px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="flex-1 min-w-[140px] px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">Save</button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-medium bg-card border border-input text-foreground rounded-md hover:bg-muted">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {Object.entries(grouped).map(([dateKey, items]) => (
        <div key={dateKey}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {dateKey !== 'No date' ? format(new Date(dateKey), 'MMM d, yyyy') : 'No date'}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          {items.map(a => (
            <div key={a.id} className="flex gap-3 px-3 py-2.5 bg-card border border-border rounded-lg mb-1.5 group hover:border-primary/30 transition-colors">
              <span className="text-[11px] text-muted-foreground min-w-[50px] pt-0.5">
                {a.start_time?.slice(0, 5) || '—'}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">{a.title}</p>
                {a.location && <p className="text-[11px] text-muted-foreground mt-0.5">{a.location}</p>}
              </div>
              <button
                onClick={() => deleteActivity.mutate(a.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ))}

      {activities.length === 0 && !showForm && (
        <p className="text-center text-sm text-muted-foreground py-8">No activities yet. Add your first one!</p>
      )}
    </motion.div>
  );
}
