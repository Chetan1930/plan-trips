import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus, Calendar, MapPin, Plane, Bed, Utensils, Camera, Car, Coffee, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Activity, Trip } from '@/lib/types';
import { useCreateActivity, useDeleteActivity } from '@/hooks/useTripData';

interface Props {
  tripId: string;
  activities: Activity[];
  trip: Trip | undefined;
}

// Smart icon helper based on activity title
function getActivityIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('flight') || t.includes('airport') || t.includes('plane')) return Plane;
  if (t.includes('hotel') || t.includes('stay') || t.includes('check-in') || t.includes('airbnb')) return Bed;
  if (t.includes('dinner') || t.includes('lunch') || t.includes('restaurant') || t.includes('food')) return Utensils;
  if (t.includes('breakfast') || t.includes('coffee') || t.includes('cafe')) return Coffee;
  if (t.includes('drive') || t.includes('car') || t.includes('taxi') || t.includes('bus')) return Car;
  if (t.includes('tour') || t.includes('museum') || t.includes('sightseeing') || t.includes('visit')) return Camera;
  return Compass; // default
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Itinerary</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Your day-by-day plan of action.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all shadow-md hover:scale-[1.02]"
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
            className="bg-gradient-to-br from-card to-secondary/30 border border-primary/20 rounded-3xl p-6 overflow-hidden shadow-lg shadow-primary/5"
          >
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">New Activity Details</h3>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Flight to Paris, Dinner at Mario's" className="w-full sm:flex-1 px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm font-medium" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location or Address" className="w-full sm:flex-1 px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="w-full sm:flex-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={trip?.start_date || undefined} max={trip?.end_date || undefined} className="w-full px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all shadow-sm" />
              </div>
              <div className="flex gap-4 w-full sm:w-auto sm:flex-1">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all shadow-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">End Time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all shadow-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end border-t border-border/50 pt-4">
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold bg-background border border-input text-foreground rounded-xl hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={createActivity.isPending || !title.trim()} className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">Save Activity</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10 mt-8">
        {Object.entries(grouped).map(([dateKey, items], groupIndex) => (
          <motion.div 
            key={dateKey}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="relative"
          >
            {/* Day Header with Stats */}
            <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-background/90 backdrop-blur-md py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    {dateKey !== 'No date' ? format(new Date(dateKey), 'EEEE, MMMM d') : 'Unscheduled Activities'}
                  </h3>
                  {dateKey !== 'No date' && trip?.start_date && (
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                      Day {Math.floor((new Date(dateKey).getTime() - new Date(trip.start_date).getTime()) / 86400000) + 1}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg border border-border">
                {items.length} plan{items.length !== 1 && 's'}
              </span>
            </div>

            {/* Timeline List */}
            <div className="relative pl-6 ml-6 space-y-5 border-l-2 border-primary/20 pb-4">
              {items.map((a, index) => {
                const SmartIcon = getActivityIcon(a.title);
                return (
                  <div key={a.id} className="relative group">
                    {/* Timeline Dot (Smart Icon) */}
                    <div className="absolute -left-[43px] top-4 w-9 h-9 rounded-full bg-background border-2 border-primary ring-4 ring-background flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                      <SmartIcon className="w-4 h-4 text-primary" />
                    </div>
                    
                    {/* Activity Card */}
                    <div className="flex flex-col sm:flex-row gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      {/* Time Column */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-start justify-center sm:min-w-[80px] text-left border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-5 gap-2 sm:gap-0">
                        <span className="text-lg font-black text-foreground">
                          {a.start_time?.slice(0, 5) || 'Any'}
                        </span>
                        {a.end_time && (
                          <span className="text-xs font-bold text-muted-foreground sm:mt-1">
                            to {a.end_time.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      
                      {/* Details Column */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-lg font-bold text-foreground truncate">{a.title}</p>
                        {a.location && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground font-medium">
                            <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                            <span className="truncate">{a.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end mt-3 sm:mt-0">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="opacity-100 sm:opacity-0 group-hover:opacity-100 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && !showForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-card border-2 border-dashed border-border rounded-3xl"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border">
              <Compass className="w-12 h-12 text-primary/50" />
            </div>
            <h3 className="text-2xl font-black text-foreground">Your itinerary is a blank canvas</h3>
            <p className="text-base text-muted-foreground mt-3 max-w-sm">
              Pro tip: Start by adding your arrival flight or check-in time for your accommodation.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-8 flex items-center gap-2 px-6 py-3 text-base font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all shadow-lg hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" /> Add Your First Activity
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}