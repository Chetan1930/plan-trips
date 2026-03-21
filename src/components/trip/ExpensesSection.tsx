import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Expense, Trip, TripMember } from '@/lib/types';
import { useCreateExpense } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';

const catEmojis: Record<string, string> = { Accommodation: '🏨', Food: '🍜', Transport: '🚗', Activities: '🎭', Shopping: '🛍', Other: '📦' };
const categories = Object.keys(catEmojis);

interface Props { tripId: string; expenses: Expense[]; trip: Trip | undefined; members: TripMember[]; }

export default function ExpensesSection({ tripId, expenses, trip, members }: Props) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  
  const currentMember = members.find(m => m.user_id === user?.id);
  const defaultPayer = currentMember?.name || user?.user_metadata?.name || 'You';
  const [paidBy, setPaidBy] = useState(defaultPayer);

  useEffect(() => {
    if (!paidBy || paidBy === 'You') {
      setPaidBy(defaultPayer);
    }
  }, [defaultPayer, paidBy]);

  const createExpense = useCreateExpense();

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const budget = Number(trip?.budget || 0);
  const fmt = (n: number) => n.toLocaleString('en-IN');

  const handleAdd = () => {
    if (!desc.trim() || !amount) return;
    createExpense.mutate(
      { trip_id: tripId, description: desc.trim(), category, amount: parseFloat(amount), paid_by: paidBy },
      {
        onSuccess: () => {
          setDesc(''); setAmount(''); setCategory('Other'); setShowForm(false);
          toast.success('Expense added');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to add expense');
        }
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 md:space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-secondary/60 border border-border/50 rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Total spent</p>
          <p className="text-xl font-medium text-foreground tabular-nums">₹{fmt(total)}</p>
        </div>
        <div className="bg-secondary/60 border border-border/50 rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Budget</p>
          <p className="text-xl font-medium text-foreground tabular-nums">₹{fmt(budget)}</p>
        </div>
        <div className="bg-secondary/60 border border-border/50 rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Remaining</p>
          <p className={`text-xl font-medium tabular-nums ${budget - total >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ₹{fmt(budget - total)}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-foreground">All expenses</p>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-secondary rounded-lg p-3 mb-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full sm:w-auto flex-1 px-2.5 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <div className="flex gap-2 w-full sm:w-auto">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full sm:w-28 px-2.5 py-2 text-sm sm:text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full sm:w-auto px-2.5 py-2 text-sm sm:text-xs bg-card border border-input rounded-md text-foreground">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="w-full sm:w-auto px-2.5 py-2 text-sm sm:text-xs bg-card border border-input rounded-md text-foreground">
                  {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  {!members.some(m => m.name === paidBy) && <option value={paidBy}>{paidBy}</option>}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={createExpense.isPending} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">Save Expense</button>
                <button onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-card border border-input rounded-md hover:bg-muted text-foreground">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          {expenses.map(e => (
            <div key={e.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="w-10 h-10 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-lg sm:text-sm">
                {catEmojis[e.category] || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-[13px] font-medium text-foreground truncate">{e.description}</p>
                <p className="text-xs sm:text-[11px] text-muted-foreground truncate">{e.category} · Paid by {e.paid_by}</p>
              </div>
              <p className="text-sm font-semibold text-foreground tabular-nums shrink-0">₹{Number(e.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No expenses yet. Add your first expense!</p>}
        </div>
      </div>
    </motion.div>
  );
}