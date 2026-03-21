import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Trip, Activity, Expense, ChecklistItem, TripMember, Comment } from '@/lib/types';

// ─── Trips ───
export function useTrips() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (trip: { name: string; destination: string; start_date?: string; end_date?: string; budget?: number; color?: string }) => {
      const { data, error } = await supabase.from('trips').insert({ ...trip, user_id: user!.id }).select().single();
      if (error) throw error;
      // Auto-add owner as member
      const initials = (user!.email || 'U').slice(0, 2).toUpperCase();
      await supabase.from('trip_members').insert({
        trip_id: data.id, name: user!.email?.split('@')[0] || 'Owner',
        email: user!.email || '', role: 'owner', initials, color: '#5DCAA5', user_id: user!.id,
      });
      return data as Trip;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<Trip> & { id: string }) => {
      const { error } = await supabase.from('trips').update(fields).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

// ─── Activities ───
export function useActivities(tripId: string | undefined) {
  return useQuery({
    queryKey: ['activities', tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from('activities').select('*').eq('trip_id', tripId!).order('activity_date').order('start_time');
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!tripId,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { trip_id: string; title: string; location?: string; activity_date?: string; start_time?: string; end_time?: string }) => {
      const { error } = await supabase.from('activities').insert(a);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

// ─── Expenses ───
export function useExpenses(tripId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').eq('trip_id', tripId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!tripId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: { trip_id: string; description: string; category: string; amount: number; paid_by?: string }) => {
      const { error } = await supabase.from('expenses').insert(e);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

// ─── Checklist ───
export function useChecklistItems(tripId: string | undefined, listType: string) {
  return useQuery({
    queryKey: ['checklist', tripId, listType],
    queryFn: async () => {
      const { data, error } = await supabase.from('checklist_items').select('*').eq('trip_id', tripId!).eq('list_type', listType).order('sort_order');
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!tripId,
  });
}

export function useCreateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { trip_id: string; text: string; list_type: string; assigned_to?: string; added_by?: string }) => {
      const { error } = await supabase.from('checklist_items').insert(item);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist'] }),
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await supabase.from('checklist_items').update({ is_done }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist'] }),
  });
}

// ─── Members ───
export function useTripMembers(tripId: string | undefined) {
  return useQuery({
    queryKey: ['members', tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from('trip_members').select('*').eq('trip_id', tripId!).order('created_at');
      if (error) throw error;
      return data as TripMember[];
    },
    enabled: !!tripId,
  });
}

export function useCreateTripMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { trip_id: string; name: string; email?: string; role?: string; initials?: string; color?: string }) => {
      const { error } = await supabase.from('trip_members').insert(m);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

// ─── Comments ───
export function useComments(tripId: string | undefined) {
  return useQuery({
    queryKey: ['comments', tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from('comments').select('*').eq('trip_id', tripId!).order('created_at');
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!tripId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: { trip_id: string; user_id: string; author_name: string; text: string; attachment_url?: string | null; attachment_type?: string | null }) => {
      const { error } = await supabase.from('comments').insert(c);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
}