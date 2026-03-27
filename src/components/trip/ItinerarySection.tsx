import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus, Calendar, MapPin, Clock } from 'lucide-react';
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Itinerary</h2>
          <p className="text-sm text-muted-foreground">Your day-by-day plan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Activity
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }} 
            animate={{ opacity: 1, height: 'auto', scale: 1 }} 
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-card border border-primary/20 rounded-2xl p-5 overflow-hidden shadow-lg shadow-primary/5"
          >
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Activity title" className="w-full sm:flex-1 px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full sm:flex-1 px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                min={trip?.start_date || undefined}
                max={trip?.end_date || undefined}
                className="w-full sm:flex-1 px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all" 
              />
              <div className="flex gap-3 w-full sm:w-auto sm:flex-1">
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full flex-1 px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all" />
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full flex-1 px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium bg-secondary text-foreground rounded-xl hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={createActivity.isPending} className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">Save Activity</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {Object.entries(grouped).map(([dateKey, items], groupIndex) => (
          <motion.div 
            key={dateKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-4 sticky top-0 z-10 bg-background/90 backdrop-blur-md py-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {dateKey !== 'No date' ? format(new Date(dateKey), 'EEEE, MMMM d') : 'Unscheduled'}
                </h3>
                {dateKey !== 'No date' && trip?.start_date && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Day {Math.floor((new Date(dateKey).getTime() - new Date(trip.start_date).getTime()) / 86400000) + 1}
                  </p>
                )}
              </div>
              <div className="flex-1 h-px bg-border ml-4" />
            </div>

            {/* Timeline List */}
            <div className="relative pl-5 ml-4 space-y-4 border-l-2 border-primary/20">
              {items.map((a, index) => (
                <div key={a.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[25px] top-4 w-3 h-3 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                  
                  {/* Activity Card */}
                  <div className="flex gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all">
                    {/* Time Column */}
                    <div className="flex flex-col items-center justify-center min-w-[60px] text-center border-r border-border pr-4">
                      <span className="text-sm font-bold text-foreground">
                        {a.start_time?.slice(0, 5) || 'Any'}
                      </span>
                      {a.end_time && (
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          to {a.end_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    
                    {/* Details Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-base font-bold text-foreground truncate">{a.title}</p>
                      {a.location && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary/70" />
                          <span className="truncate">{a.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && !showForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-3xl"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
              <Calendar className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-bold text-foreground">Your itinerary is empty</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">Start building your perfect trip by adding your first activity above.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add First Activity
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}