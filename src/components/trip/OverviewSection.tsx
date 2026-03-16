import { format } from 'date-fns';
import type { Trip, Activity, Expense, ChecklistItem, TripMember } from '@/lib/types';
import { motion } from 'framer-motion';

interface OverviewProps {
  trip: Trip | undefined;
  activities: Activity[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  members: TripMember[];
}

export default function OverviewSection({ trip, activities, expenses, checklist, members }: OverviewProps) {
  if (!trip) return <EmptyState />;

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const checkDone = checklist.filter(c => c.is_done).length;
  const dateRange = trip.start_date && trip.end_date
    ? `${format(new Date(trip.start_date), 'MMM d')} – ${format(new Date(trip.end_date), 'MMM d')}`
    : 'No dates set';
  const days = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000) + 1
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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
            </div>
          ))}
          {members.length === 0 && <p className="text-xs text-muted-foreground">No members yet</p>}
        </div>
      </div>
    </motion.div>
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
