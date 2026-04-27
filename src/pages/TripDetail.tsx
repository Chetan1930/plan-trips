import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrips, useActivities, useExpenses, useChecklistItems, useTripMembers, useComments } from '@/hooks/useTripData';
import Sidebar from '@/components/trip/Sidebar';
import OverviewSection from '@/components/trip/OverviewSection';
import ItinerarySection from '@/components/trip/ItinerarySection';
import ExpensesSection from '@/components/trip/ExpensesSection';
import ChecklistsSection from '@/components/trip/ChecklistsSection';
import MembersSection from '@/components/trip/MembersSection';
import CommentsSection from '@/components/trip/CommentsSection';
import CreateTripDialog from '@/components/trip/CreateTripDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { NavSection } from '@/lib/types';

const sectionMap: Record<NavSection, string> = {
  overview: 'Overview', itinerary: 'Itinerary', expenses: 'Expenses',
  checklists: 'Checklists', members: 'Members', comments: 'Comments',
  invitations: 'Invitations', profile: 'Profile',
};

const routeSections: NavSection[] = ['overview', 'itinerary', 'expenses', 'checklists', 'members', 'comments', 'invitations'];

function isNavSection(value: string): value is NavSection {
  return routeSections.includes(value as NavSection);
}

export default function TripDetail() {
  const { tripId, section } = useParams<{ tripId: string; section?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const activeSection: NavSection = section && isNavSection(section) ? section : 'overview';
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: trips = [] } = useTrips();
  const activeTrip = trips.find(t => t.id === tripId);

  const { data: activities = [] } = useActivities(tripId);
  const { data: expenses = [] } = useExpenses(tripId);
  const { data: checklist = [] } = useChecklistItems(tripId, 'checklist');
  const { data: packing = [] } = useChecklistItems(tripId, 'packing');
  const { data: members = [] } = useTripMembers(tripId);
  const { data: comments = [] } = useComments(tripId);

  // Redirect if trip doesn't exist once loaded
  useEffect(() => {
    if (trips.length > 0 && tripId && !activeTrip) {
      navigate('/dashboard', { replace: true });
    }
  }, [trips, tripId, activeTrip, navigate]);

  const handleNavSection = (nav: NavSection) => {
    if (nav === 'profile') {
      navigate('/profile');
    } else if (nav === 'invitations') {
      navigate('/invitations');
    } else {
      navigate(`/trip/${tripId}/${nav}`);
    }
    setIsMobileMenuOpen(false);
  };

  const handleTripSwitch = (id: string) => {
    navigate(`/trip/${id}/${activeSection}`);
    setIsMobileMenuOpen(false);
  };

  if (!tripId) return null;

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden relative">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          activeNav={activeSection}
          setActiveNav={handleNavSection}
          trips={trips}
          activeTripId={tripId}
          setActiveTripId={handleTripSwitch}
          onCreateTrip={() => setShowCreateTrip(true)}
          onNavClick={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="bg-card border-b border-border px-4 md:px-5 h-[52px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button className="md:hidden p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground rounded-md" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/dashboard')} className="p-1 text-muted-foreground hover:text-foreground rounded-md">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-medium text-foreground">{sectionMap[activeSection] || 'Overview'}</span>
            {activeTrip && (
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                {activeTrip.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {activeSection === 'overview' && <OverviewSection trip={activeTrip} activities={activities} expenses={expenses} checklist={[...checklist, ...packing]} members={members} onTripDeleted={() => navigate('/dashboard')} />}
          {activeSection === 'itinerary' && <ItinerarySection tripId={tripId} activities={activities} trip={activeTrip} />}
          {activeSection === 'expenses' && <ExpensesSection tripId={tripId} expenses={expenses} trip={activeTrip} members={members} />}
          {activeSection === 'checklists' && <ChecklistsSection tripId={tripId} checklist={checklist} packing={packing} />}
          {activeSection === 'members' && <MembersSection tripId={tripId} members={members} />}
          {activeSection === 'comments' && <CommentsSection tripId={tripId} comments={comments} members={members} trip={activeTrip} />}
        </div>
      </div>

      <CreateTripDialog open={showCreateTrip} onClose={() => setShowCreateTrip(false)} />
    </div>
  );
}
