import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Activity, Trip } from '@/lib/types';
import { useCreateActivity, useDeleteActivity } from '@/hooks/useTripData';

interface Props {
  tripId: string;
  activities: Activity[];
  trip: Trip | undefined;
}

export default function ItinerarySection({ tripId, activities, trip }: Props) {
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
    createActivity.mutate(
      {
        trip_id: tripId,
        title: title.trim(),
        location: location || undefined,
        activity_date: date || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
      },
      {
        onSuccess: () => {
          setTitle(''); setLocation(''); setDate(''); setStartTime(''); setEndTime('');
          setShowForm(false);
          toast.success('Activity added');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to add activity');
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteActivity.mutate(id, {
      onError: (err: any) => toast.error(err.message || 'Failed to delete activity')
    });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
            className="bg-secondary rounded-lg p-3 md:p-4 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-2 md:mb-3 mb-2">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Activity title" className="w-full sm:flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full sm:flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:mb-4 mb-3">
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                min={trip?.start_date || undefined}
                max={trip?.end_date || undefined}
                className="w-full sm:flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" 
              />
              <div className="flex gap-2 w-full sm:w-auto sm:flex-1">
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full flex-1 px-3 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={createActivity.isPending} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">Save Activity</button>
              <button onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-card border border-input text-foreground rounded-md hover:bg-muted">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {Object.entries(grouped).map(([dateKey, items]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-background pr-2">
                {dateKey !== 'No date' ? format(new Date(dateKey), 'MMM d, yyyy') : 'No date'}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {items.map(a => (
                <div key={a.id} className="flex gap-3 px-3 py-3 sm:py-2.5 bg-card border border-border/70 shadow-sm sm:shadow-none rounded-lg group hover:border-primary/30 transition-colors">
                  <span className="text-xs text-muted-foreground min-w-[50px] pt-0.5 font-medium">
                    {a.start_time?.slice(0, 5) || '—'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                    {a.location && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.location}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {activities.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed border-border rounded-xl">
            <Calendar className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No activities yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Start building your trip itinerary by adding an activity above.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}