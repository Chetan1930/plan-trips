import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTrips, useActivities, useExpenses, useChecklistItems, useTripMembers, useComments } from '@/hooks/useTripData';
import Sidebar from '@/components/trip/Sidebar';
import OverviewSection from '@/components/trip/OverviewSection';
import ItinerarySection from '@/components/trip/ItinerarySection';
import ExpensesSection from '@/components/trip/ExpensesSection';
import ChecklistsSection from '@/components/trip/ChecklistsSection';
import MembersSection from '@/components/trip/MembersSection';
import CommentsSection from '@/components/trip/CommentsSection';
import InvitationsSection from '@/components/trip/InvitationsSection';
import CreateTripDialog from '@/components/trip/CreateTripDialog';
import type { NavSection } from '@/lib/types';

const navTitles: Record<NavSection, string> = {
  overview: 'Overview', itinerary: 'Itinerary', expenses: 'Expenses',
  checklists: 'Checklists', members: 'Members', comments: 'Comments',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [activeTripId, setActiveTripId] = useState<string>();
  const [showCreateTrip, setShowCreateTrip] = useState(false);

  const { data: trips = [] } = useTrips();
  const activeTrip = trips.find(t => t.id === activeTripId);

  useEffect(() => {
    if (trips.length > 0 && !activeTripId) setActiveTripId(trips[0].id);
    if (trips.length > 0 && activeTripId && !trips.find(t => t.id === activeTripId)) {
      setActiveTripId(trips[0].id);
    }
  }, [trips, activeTripId]);

  const { data: activities = [] } = useActivities(activeTripId);
  const { data: expenses = [] } = useExpenses(activeTripId);
  const { data: checklist = [] } = useChecklistItems(activeTripId, 'checklist');
  const { data: packing = [] } = useChecklistItems(activeTripId, 'packing');
  const { data: members = [] } = useTripMembers(activeTripId);
  const { data: comments = [] } = useComments(activeTripId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        trips={trips}
        activeTripId={activeTripId}
        setActiveTripId={setActiveTripId}
        onCreateTrip={() => setShowCreateTrip(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-card border-b border-border px-5 h-[52px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-medium text-foreground">{navTitles[activeNav]}</span>
            {activeTrip && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                {activeTrip.name}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!activeTripId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground text-sm mb-3">No trips yet. Create your first one!</p>
              <button
                onClick={() => setShowCreateTrip(true)}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90"
              >
                Create Trip
              </button>
            </div>
          ) : (
            <>
              {activeNav === 'overview' && <OverviewSection trip={activeTrip} activities={activities} expenses={expenses} checklist={[...checklist, ...packing]} members={members} onTripDeleted={() => setActiveTripId(undefined)} />}
              {activeNav === 'itinerary' && <ItinerarySection tripId={activeTripId} activities={activities} />}
              {activeNav === 'expenses' && <ExpensesSection tripId={activeTripId} expenses={expenses} trip={activeTrip} />}
              {activeNav === 'checklists' && <ChecklistsSection tripId={activeTripId} checklist={checklist} packing={packing} />}
              {activeNav === 'members' && <MembersSection tripId={activeTripId} members={members} />}
              {activeNav === 'comments' && <CommentsSection tripId={activeTripId} comments={comments} members={members} />}
            </>
          )}
        </div>
      </div>

      <CreateTripDialog open={showCreateTrip} onClose={() => setShowCreateTrip(false)} />
    </div>
  );
}
