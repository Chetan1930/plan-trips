import { useState, useEffect } from 'react';
import { Plus, Receipt, IndianRupee, PieChart, TrendingDown } from 'lucide-react';
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
  const remaining = budget - total;
  const fmt = (n: number) => n.toLocaleString('en-IN');
  const percentage = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted-foreground">Track and split costs</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</p>
            <div className="p-1.5 bg-secondary rounded-lg"><TrendingDown className="w-4 h-4 text-muted-foreground" /></div>
          </div>
          <p className="text-3xl font-black text-foreground tabular-nums">₹{fmt(total)}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Budget</p>
            <div className="p-1.5 bg-secondary rounded-lg"><PieChart className="w-4 h-4 text-muted-foreground" /></div>
          </div>
          <p className="text-3xl font-black text-foreground tabular-nums">₹{fmt(budget)}</p>
          <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <div className={`rounded-2xl p-5 shadow-sm border ${remaining >= 0 ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20'}`}>
          <div className="flex justify-between items-start mb-2">
            <p className={`text-xs font-semibold uppercase tracking-wider ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>Remaining</p>
            <div className={`p-1.5 rounded-lg ${remaining >= 0 ? 'bg-primary/20' : 'bg-destructive/20'}`}>
              <IndianRupee className={`w-4 h-4 ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </div>
          </div>
          <p className={`text-3xl font-black tabular-nums ${remaining >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            ₹{fmt(Math.abs(remaining))} {remaining < 0 && <span className="text-sm font-semibold ml-1">Over</span>}
          </p>
        </div>
      </div>

      {/* Main Expenses List */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} className="bg-secondary/40 border border-primary/20 rounded-xl p-5 mb-5 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
                <div className="sm:col-span-5">
                  <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What was this for?" className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm" />
                </div>
                <div className="sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm" />
                  </div>
                </div>
                <div className="sm:col-span-4 flex gap-3">
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full flex-1 px-3 py-2.5 text-sm bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm">
                    {categories.map(c => <option key={c} value={c}>{catEmojis[c]} {c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid By</span>
                  <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="flex-1 sm:w-48 px-3 py-2 text-sm bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm">
                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    {!members.some(m => m.name === paidBy) && <option value={paidBy}>{paidBy}</option>}
                  </select>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium bg-background border border-input rounded-xl hover:bg-muted text-foreground transition-colors shadow-sm">Cancel</button>
                  <button onClick={handleAdd} disabled={createExpense.isPending} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm shadow-primary/20">Save</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {expenses.map(e => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              key={e.id} 
              className="flex items-center gap-4 p-4 border border-border/60 rounded-2xl hover:border-border hover:shadow-sm transition-all bg-background/50"
            >
              <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-xl shadow-sm border border-border/40">
                {catEmojis[e.category] || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground truncate">{e.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/80 px-2 py-0.5 rounded-md">
                    {e.category}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">Paid by <strong className="text-foreground">{e.paid_by}</strong></span>
                </div>
              </div>
              <p className="text-lg font-black text-foreground tabular-nums shrink-0">₹{Number(e.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </motion.div>
          ))}
          
          {expenses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/20">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-bold text-foreground">No expenses yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">Start tracking your group spending by adding your first expense.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}