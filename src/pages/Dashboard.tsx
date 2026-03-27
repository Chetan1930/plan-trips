import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Calendar, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrips } from '@/hooks/useTripData';
import CreateTripDialog from '@/components/trip/CreateTripDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import type { Trip } from '@/lib/types';

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const startDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;
  const endDate = trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:shadow-primary/5 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: trip.color + '20' }}>
          <MapPin className="w-5 h-5" style={{ color: trip.color }} />
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h3 className="font-semibold text-foreground text-base">{trip.name}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{trip.destination}</p>
      {startDate && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{startDate}{endDate ? ` — ${endDate}` : ''}</span>
        </div>
      )}
      {trip.budget > 0 && (
        <p className="text-xs text-muted-foreground mt-1.5">
          Budget: ₹{trip.budget.toLocaleString('en-IN')}
        </p>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const { data: trips = [] } = useTrips();

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Topbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Wandr</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate('/invitations')}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Invitations
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-medium">
                {initial}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Trips</h1>
            <p className="text-sm text-muted-foreground mt-1">Plan, collaborate, and explore together.</p>
          </div>
          <button
            onClick={() => setShowCreateTrip(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No trips yet</h2>
            <p className="text-muted-foreground text-sm mt-2 mb-6 max-w-sm">
              Create your first trip to start planning an amazing adventure with your friends.
            </p>
            <button
              onClick={() => setShowCreateTrip(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Create Your First Trip
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={() => navigate(`/trip/${trip.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTripDialog open={showCreateTrip} onClose={() => setShowCreateTrip(false)} />
    </div>
  );
}
