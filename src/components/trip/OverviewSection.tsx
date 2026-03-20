import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Trip, Activity, Expense, ChecklistItem, TripMember } from '@/lib/types';
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
  activities: Activity[];
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {/* Admin controls */}
      {isAdmin && (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors">
            <Pencil className="w-3 h-3" /> Edit Trip
          </button>
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-destructive/30 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Destination" value={trip.destination} />
        <Metric label="Duration" value={days ? `${days} days` : '—'} sub={dateRange} />
        <Metric label="Total Budget" value={`$${Number(trip.budget).toLocaleString()}`} sub={`$${totalSpent.toLocaleString()} spent`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricProgress label="Activities planned" value={activities.length} max={Math.max(activities.length, 1)} />
        <MetricProgress label="Checklist progress" value={checkDone} max={Math.max(checklist.length, 1)} extra={`${checkDone}/${checklist.length}`} />
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-[13px] font-medium text-foreground mb-3">Trip members</p>
        <div className="flex flex-wrap gap-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-full">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: m.color, color: '#fff' }}>
                {m.initials}
              </div>
              <span className="text-xs text-foreground">{m.name}</span>
              <span className="text-[10px] text-muted-foreground">{m.role}</span>
            </div>
          ))}
          {members.length === 0 && <p className="text-xs text-muted-foreground">No members yet</p>}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{trip.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this trip and all its activities, expenses, checklists, members, and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

  // Reset form when trip changes
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
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Trip</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Trip name" value={name} onChange={setName} />
          <Field label="Destination" value={destination} onChange={setDestination} />
          <Field label="Budget" value={budget} onChange={setBudget} type="number" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" value={startDate} onChange={setStartDate} type="date" />
            <Field label="End date" value={endDate} onChange={setEndDate} type="date" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium border border-input rounded-md hover:bg-muted text-foreground">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">Save Changes</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-sm bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-secondary rounded-lg p-3">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-medium text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function MetricProgress({ label, value, max, extra }: { label: string; value: number; max: number; extra?: string }) {
  return (
    <div className="bg-secondary rounded-lg p-3">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-medium text-foreground">{extra || value}</p>
      <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
      Select or create a trip to get started
    </div>
  );
}
