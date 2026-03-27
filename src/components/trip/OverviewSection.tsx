import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, MapPin, Calendar, IndianRupee, Activity, CheckCircle2 } from 'lucide-react';
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
  const dateRange = trip.start_date && trip.end_date
    ? `${format(new Date(trip.start_date), 'MMM d')} – ${format(new Date(trip.end_date), 'MMM d')}`
    : 'No dates set';
  const days = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000) + 1
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
      {/* Header & Admin controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{trip.name}</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {trip.destination}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit Trip
            </button>
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-destructive/20 bg-destructive/5 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Destination Card - Highlighted */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Destination</p>
          <p className="text-2xl font-bold text-foreground relative z-10">{trip.destination}</p>
        </div>

        <MetricCard 
          icon={Calendar} 
          label="Duration" 
          value={days ? `${days} days` : '—'} 
          sub={dateRange} 
        />
        <MetricCard 
          icon={IndianRupee} 
          label="Budget Status" 
          value={`₹${totalSpent.toLocaleString('en-IN')}`} 
          sub={`of ₹${Number(trip.budget).toLocaleString('en-IN')} total`} 
        />
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricProgress 
          icon={Activity}
          label="Activities planned" 
          value={activities.length} 
          max={Math.max(activities.length, 1)} 
          colorClass="bg-blue-500"
        />
        <MetricProgress 
          icon={CheckCircle2}
          label="Checklist progress" 
          value={checkDone} 
          max={Math.max(checklist.length, 1)} 
          extra={`${checkDone} of ${checklist.length} tasks`} 
          colorClass="bg-primary"
        />
      </div>

      {/* Members Section */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">Travel Crew</p>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {members.length} member{members.length !== 1 && 's'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 border border-border/60 rounded-full bg-secondary/30 hover:bg-secondary/60 transition-colors">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ background: m.color, color: '#fff' }}>
                {m.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground leading-none">{m.name}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5 leading-none uppercase">{m.role}</span>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="text-sm text-muted-foreground">No members yet</p>}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="w-[90vw] max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{trip.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this trip and all its activities, expenses, checklists, members, and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
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
      <DialogContent className="max-w-md w-[90vw] rounded-2xl p-6">
        <DialogHeader><DialogTitle className="text-xl">Edit Trip</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <Field label="Trip name" value={name} onChange={setName} />
          <Field label="Destination" value={destination} onChange={setDestination} />
          <Field label="Budget" value={budget} onChange={setBudget} type="number" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start date" value={startDate} onChange={setStartDate} type="date" />
            <Field label="End date" value={endDate} onChange={setEndDate} type="date" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-input rounded-xl hover:bg-muted text-foreground transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">Save Changes</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all shadow-sm" />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {sub && <p className="text-[13px] text-muted-foreground mt-1 font-medium">{sub}</p>}
    </div>
  );
}

function MetricProgress({ icon: Icon, label, value, max, extra, colorClass }: { icon: any; label: string; value: number; max: number; extra?: string; colorClass: string }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold text-foreground">{label}</p>
        </div>
        <span className="text-xl font-black tabular-nums text-foreground">{extra || value}</span>
      </div>
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClass} rounded-full relative`}
        >
          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
      <p className="text-right text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">{percentage}% Complete</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <MapPin className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">No Trip Selected</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Select a trip from the sidebar or create a new one to view its overview and start planning.
      </p>
    </div>
  );
}