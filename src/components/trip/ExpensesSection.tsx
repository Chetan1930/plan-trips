import { useState, useEffect } from 'react';
import { Plus, Receipt, IndianRupee, PieChart, TrendingDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Expense, Trip, TripMember } from '@/lib/types';
import { useCreateExpense } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';

const catEmojis: Record<string, string> = { Accommodation: '🏨', Food: '🍜', Transport: '🚗', Activities: '🎭', Shopping: '🛍', Other: '📦' };
const catColors: Record<string, string> = { Accommodation: 'bg-blue-500', Food: 'bg-orange-500', Transport: 'bg-green-500', Activities: 'bg-purple-500', Shopping: 'bg-pink-500', Other: 'bg-gray-500' };
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
    if (!paidBy || paidBy === 'You') setPaidBy(defaultPayer);
  }, [defaultPayer, paidBy]);

  const createExpense = useCreateExpense();

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const budget = Number(trip?.budget || 0);
  const remaining = budget - total;
  const fmt = (n: number) => n.toLocaleString('en-IN');
  const percentage = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;

  // Calculate category totals for the breakdown bar
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);
  
  const categoryBreakdown = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .map(([cat, amt]) => ({ cat, amt, percent: total > 0 ? (amt / total) * 100 : 0 }));

  const handleAdd = () => {
    if (!desc.trim() || !amount) return;
    createExpense.mutate(
      { trip_id: tripId, description: desc.trim(), category, amount: parseFloat(amount), paid_by: paidBy },
      {
        onSuccess: () => {
          setDesc(''); setAmount(''); setCategory('Other'); setShowForm(false);
          toast.success('Expense added successfully');
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to add expense')
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Expenses</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Track your group spending and stay on budget.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all shadow-md hover:scale-[1.02]">
          <Plus className="w-4 h-4" /> Log Expense
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Spent</p>
            <div className="p-2 bg-secondary rounded-xl"><TrendingDown className="w-4 h-4 text-foreground" /></div>
          </div>
          <p className="text-4xl font-black text-foreground tabular-nums tracking-tight">₹{fmt(total)}</p>
          <p className="text-xs font-medium text-muted-foreground mt-2">Across {expenses.length} transactions</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trip Budget</p>
            <div className="p-2 bg-secondary rounded-xl"><PieChart className="w-4 h-4 text-foreground" /></div>
          </div>
          <p className="text-4xl font-black text-foreground tabular-nums tracking-tight">₹{fmt(budget)}</p>
          <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${percentage > 100 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
          </div>
        </div>

        <div className={`rounded-3xl p-6 shadow-sm border ${remaining >= 0 ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-xs font-bold uppercase tracking-wider ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>{remaining >= 0 ? 'Remaining Budget' : 'Over Budget'}</p>
            <div className={`p-2 rounded-xl ${remaining >= 0 ? 'bg-primary/20' : 'bg-destructive/20'}`}>
              <IndianRupee className={`w-4 h-4 ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </div>
          </div>
          <p className={`text-4xl font-black tabular-nums tracking-tight ${remaining >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            ₹{fmt(Math.abs(remaining))}
          </p>
          <p className={`text-xs font-bold mt-2 ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {remaining >= 0 ? 'You are doing great!' : 'Time to slow down spending.'}
          </p>
        </div>
      </div>

      {/* Category Breakdown Bar (Only show if expenses exist) */}
      {expenses.length > 0 && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Spending Breakdown</h3>
          <div className="w-full h-4 rounded-full flex overflow-hidden mb-4">
            {categoryBreakdown.map(cb => (
              <div key={cb.cat} style={{ width: `${cb.percent}%` }} className={`h-full ${catColors[cb.cat] || 'bg-gray-500'} transition-all`} title={`${cb.cat}: ₹${fmt(cb.amt)}`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold">
            {categoryBreakdown.slice(0, 4).map(cb => (
              <div key={cb.cat} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${catColors[cb.cat] || 'bg-gray-500'}`} />
                <span className="text-foreground">{cb.cat}</span>
                <span className="text-muted-foreground">({Math.round(cb.percent)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Expenses List */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-black text-foreground mb-6">Recent Transactions</h3>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} className="bg-gradient-to-br from-card to-secondary/30 border border-primary/20 rounded-2xl p-6 mb-6 overflow-hidden shadow-lg shadow-primary/5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-5">
                <div className="sm:col-span-5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Description</label>
                  <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Flight tickets, Dinner..." className="w-full px-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm font-medium" />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₹</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all shadow-sm font-black" />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 text-sm bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-medium">
                    {categories.map(c => <option key={c} value={c}>{catEmojis[c]} {c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Paid By</span>
                  <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="flex-1 sm:w-48 px-4 py-2 text-sm bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-bold">
                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    {!members.some(m => m.name === paidBy) && <option value={paidBy}>{paidBy}</option>}
                  </select>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold bg-background border border-input rounded-xl hover:bg-muted text-foreground transition-colors shadow-sm">Cancel</button>
                  <button onClick={handleAdd} disabled={createExpense.isPending} className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">Save Expense</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {expenses.map(e => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={e.id} 
              className="flex items-center gap-4 p-5 border border-border/80 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all bg-background/50 group"
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-2xl shadow-sm border border-border group-hover:scale-110 transition-transform">
                {catEmojis[e.category] || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-foreground truncate">{e.description}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/80 border border-border/50 px-2.5 py-1 rounded-lg">
                    {e.category}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Paid by <strong className="text-foreground">{e.paid_by}</strong>
                  </span>
                  <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground opacity-50">
                    • {format(new Date(e.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums shrink-0">₹{Number(e.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </motion.div>
          ))}
          
          {expenses.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/10">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5 border border-border">
                <Receipt className="w-10 h-10 text-primary/50" />
              </div>
              <p className="text-2xl font-black text-foreground">No expenses yet</p>
              <p className="text-base text-muted-foreground mt-2 max-w-[300px]">Keep track of who paid what by adding your first group expense.</p>
              <button onClick={() => setShowForm(true)} className="mt-8 flex items-center gap-2 px-6 py-3 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all shadow-lg">
                Log First Expense <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}