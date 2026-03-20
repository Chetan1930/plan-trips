import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense, Trip } from '@/lib/types';
import { useCreateExpense } from '@/hooks/useTripData';

const catEmojis: Record<string, string> = { Accommodation: '🏨', Food: '🍜', Transport: '🚗', Activities: '🎭', Shopping: '🛍', Other: '📦' };
const categories = Object.keys(catEmojis);

interface Props { tripId: string; expenses: Expense[]; trip: Trip | undefined; }

export default function ExpensesSection({ tripId, expenses, trip }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const createExpense = useCreateExpense();

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const budget = Number(trip?.budget || 0);
  const fmt = (n: number) => n.toLocaleString('en-IN');

  const handleAdd = () => {
    if (!desc.trim() || !amount) return;
    createExpense.mutate({ trip_id: tripId, description: desc.trim(), category, amount: parseFloat(amount), paid_by: 'You' });
    setDesc(''); setAmount(''); setCategory('Other'); setShowForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Total spent</p>
          <p className="text-xl font-medium text-foreground tabular-nums">₹{total.toLocaleString()}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Budget</p>
          <p className="text-xl font-medium text-foreground tabular-nums">₹{budget.toLocaleString()}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Remaining</p>
          <p className={`text-xl font-medium tabular-nums ${budget - total >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ₹{(budget - total).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-medium text-foreground">All expenses</p>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-input rounded-md hover:bg-muted text-foreground transition-colors">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-secondary rounded-lg p-3 mb-3 overflow-hidden">
              <div className="flex gap-2 mb-2 flex-wrap">
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="flex-1 min-w-[120px] px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-24 px-2.5 py-1.5 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
                <select value={category} onChange={e => setCategory(e.target.value)} className="px-2.5 py-1.5 text-xs bg-card border border-input rounded-md text-foreground">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">Save</button>
                <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-medium bg-card border border-input rounded-md hover:bg-muted text-foreground">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {expenses.map(e => (
          <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm">
              {catEmojis[e.category] || '📦'}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-foreground">{e.description}</p>
              <p className="text-[11px] text-muted-foreground">{e.category} · {e.paid_by}</p>
            </div>
            <p className="text-sm font-medium text-foreground tabular-nums">₹{Number(e.amount).toFixed(2)}</p>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No expenses yet</p>}
      </div>
    </motion.div>
  );
}
