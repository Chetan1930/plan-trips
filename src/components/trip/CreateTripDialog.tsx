import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { useCreateTrip } from '@/hooks/useTripData';

const tripColors = ['#1D9E75', '#D85A30', '#378ADD', '#8B5CF6', '#E84393'];

interface Props { open: boolean; onClose: () => void; }

export default function CreateTripDialog({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState(tripColors[0]);
  const createTrip = useCreateTrip();

  const handleCreate = () => {
    if (!name.trim() || !destination.trim()) return;
    createTrip.mutate({
      name: name.trim(),
      destination: destination.trim(),
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      color,
    }, {
      onSuccess: () => {
        setName(''); setDestination(''); setStartDate(''); setEndDate(''); setBudget('');
        onClose();
      },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/20" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-5 w-full max-w-md shadow-lg z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">New Trip</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Trip name" className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground" />
              <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground" />
              <div className="flex gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground" />
              </div>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Budget ($)" className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground" />
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground">Color:</span>
                {tripColors.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-ring ring-offset-2 ring-offset-card' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim() || !destination.trim()} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">Create Trip</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
