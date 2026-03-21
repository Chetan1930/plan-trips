export interface Trip {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  color: string;
  created_at: string;
}

export interface Activity {
  id: string;
  trip_id: string;
  title: string;
  location: string | null;
  activity_date: string | null;
  start_time: string | null;
  end_time: string | null;
  sort_order: number | null;
}

export interface Expense {
  id: string;
  trip_id: string;
  description: string;
  category: string;
  amount: number;
  paid_by: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  trip_id: string;
  text: string;
  is_done: boolean;
  list_type: string;
  assigned_to: string | null;
  added_by?: string | null;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  role: string;
  initials: string | null;
  color: string;
}

export interface Comment {
  id: string;
  trip_id: string;
  user_id: string;
  author_name: string;
  text: string;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
}

export type NavSection = 'overview' | 'itinerary' | 'expenses' | 'checklists' | 'members' | 'comments' | 'invitations' | 'profile';