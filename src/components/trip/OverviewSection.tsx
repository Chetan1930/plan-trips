import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, MapPin, Calendar, IndianRupee, Activity, CheckCircle2, Globe2, PlaneTakeoff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Trip, Activity as TripActivity, Expense, ChecklistItem, TripMember } from '@/lib/types';
import { useUpdateTrip, useDeleteTrip } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OverviewProps {
  trip: Trip | undefined;
  activities: TripActivity[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  members: TripMember[];
  onTripDeleted?: () => void;
}

export default function OverviewSection({ trip, activities, expenses, checklist, members, onTripDeleted }: OverviewProps) {
  const { user } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const deleteTrip = useDeleteTrip();
  const updateTrip = useUpdateTrip();

  if (!trip) return <EmptyState />;

  const isAdmin = trip.user_id === user?.id;
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const checkDone = checklist.filter(c => c.is_done).length;
  
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  const endDate = trip.end_date ? new Date(trip.end_date) : null;
  
  const dateRange = startDate && endDate
    ? `${format(startDate, 'MMMM d')} – ${format(endDate, 'MMMM d, yyyy')}`
    : 'No dates set for this trip';
    
  const days = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    : 0;

  const handleDelete = () => {
    deleteTrip.mutate(trip.id, {
      onSuccess: () => { toast.success('Trip deleted'); onTripDeleted?.(); },
      onError: () => toast.error('Failed to delete trip'),
    });
    setShowDelete(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute -top-24 -right-24 opacity-10 pointer-events-none">
          <Globe2 className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              Upcoming Adventure
            </div>
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">{trip.name}</h2>
              <p className="text-lg text-muted-foreground mt-2 flex items-center gap-2 font-medium">
                <MapPin className="w-5 h-5 text-primary" /> {trip.destination}
              </p>
            </div>
            
            <p className="text-sm text-foreground/80 flex items-center gap-2 font-medium bg-background/50 inline-flex px-3 py-1.5 rounded-lg border border-border/50 backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" /> {dateRange} {days > 0 && `(${days} days)`}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <button onClick={() => setShowEdit(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-card border border-border rounded-xl hover:border-primary/50 hover:text-primary transition-all shadow-sm">
                <Pencil className="w-4 h-4" /> Edit Details
              </button>
              <button onClick={() => setShowDelete(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-destructive/20 bg-destructive/5 text-destructive rounded-xl hover:bg-destructive/10 transition-colors shadow-sm">
                <Trash2 className="w-4 h-4" /> Delete Trip
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <h3 className="text-lg font-bold text-foreground">Trip Insights</h3>
        <div className="flex-1 h-px bg-border ml-2" />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricProgress 
          icon={Activity}
          label="Activities" 
          value={activities.length} 
          max={Math.max(activities.length, 1)} 
          extra={`${activities.length} planned`} 
          colorClass="bg-blue-500"
          desc="Items in itinerary"
        />
        <MetricProgress 
          icon={CheckCircle2}
          label="Checklist" 
          value={checkDone} 
          max={Math.max(checklist.length, 1)} 
          extra={`${checkDone}/${checklist.length} done`} 
          colorClass="bg-primary"
          desc="Tasks completed"
        />
        <div className="sm:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">Budget Overview</p>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-3xl font-black text-foreground tabular-nums">₹{totalSpent.toLocaleString('en-IN')}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">spent out of ₹{Number(trip.budget).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${totalSpent > (trip.budget || 0) ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {totalSpent > (trip.budget || 0) ? 'Over Budget' : 'On Track'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-lg font-bold text-foreground">Travel Crew</p>
            <p className="text-sm text-muted-foreground mt-0.5">The people making this trip amazing.</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
            {members.length} Member{members.length !== 1 && 's'}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 border border-border rounded-xl bg-background hover:border-primary/40 hover:shadow-sm transition-all group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-110 transition-transform" style={{ background: m.color, color: '#fff' }}>
                {m.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-none">{m.name}</span>
                <span className="text-[10px] text-muted-foreground mt-1 leading-none uppercase font-semibold tracking-wider">{m.role}</span>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="text-sm text-muted-foreground">No members yet</p>}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="w-[90vw] max-w-md rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Delete "{trip.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete this trip and all its activities, expenses, checklists, members, and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6">
              Delete Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <EditTripDialog trip={trip} open={showEdit} onClose={() => setShowEdit(false)} onSave={updateTrip} />
    </motion.div>
  );
}

function EditTripDialog({ trip, open, onClose, onSave }: { trip: Trip; open: boolean; onClose: () => void; onSave: ReturnType<typeof useUpdateTrip> }) {
  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination);
  const [budget, setBudget] = useState(String(trip.budget || 0));
  const [startDate, setStartDate] = useState(trip.start_date || '');
  const [endDate, setEndDate] = useState(trip.end_date || '');

  const [prevId, setPrevId] = useState(trip.id);
  if (trip.id !== prevId) {
    setPrevId(trip.id);
    setName(trip.name); setDestination(trip.destination);
    setBudget(String(trip.budget || 0)); setStartDate(trip.start_date || ''); setEndDate(trip.end_date || '');
  }

  const handleSave = () => {
    onSave.mutate({
      id: trip.id, name, destination,
      budget: Number(budget) || 0,
      start_date: startDate || null,
      end_date: endDate || null,
    }, {
      onSuccess: () => { toast.success('Trip updated'); onClose(); },
      onError: () => toast.error('Failed to update'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md w-[90vw] rounded-3xl p-6">
        <DialogHeader><DialogTitle className="text-2xl font-bold">Edit Trip Details</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <Field label="Trip name" value={name} onChange={setName} />
          <Field label="Destination" value={destination} onChange={setDestination} />
          <Field label="Total Budget (₹)" value={budget} onChange={setBudget} type="number" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start date" value={startDate} onChange={setStartDate} type="date" />
            <Field label="End date" value={endDate} onChange={setEndDate} type="date" />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium border border-input rounded-xl hover:bg-muted text-foreground transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm">Save Changes</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block ml-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all shadow-sm" />
    </div>
  );
}

function MetricProgress({ icon: Icon, label, value, max, extra, colorClass, desc }: { icon: LucideIcon; label: string; value: number; max: number; extra?: string; colorClass: string; desc: string }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
        </div>
        <span className="text-2xl font-black tabular-nums text-foreground">{extra || value}</span>
      </div>
      <p className="text-sm font-bold text-foreground mb-1">{label}</p>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClass} rounded-full relative`}
        />
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">{desc}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
        <MapPin className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-3xl font-black text-foreground tracking-tight">Select a Trip</h2>
      <p className="text-muted-foreground mt-3 max-w-md text-lg">
        Choose a trip from the sidebar to view its details, or create a brand new adventure to get started.
      </p>
    </div>
  );
}