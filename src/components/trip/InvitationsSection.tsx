import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  trip_id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  created_at: string;
  trip_name?: string;
  trip_destination?: string;
  invited_by?: string;
}

export default function InvitationsSection() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations', user?.email],
    queryFn: async () => {
      // Get pending members matching user's email where user_id is null
      const { data: members, error } = await supabase
        .from('trip_members')
        .select('*')
        .eq('email', user!.email!)
        .is('user_id', null);
      if (error) throw error;

      // Fetch trip details and inviter info for each invitation
      const enriched: Invitation[] = [];
      for (const m of members || []) {
        const { data: trip } = await supabase.from('trips').select('name, destination, user_id').eq('id', m.trip_id).single();
        let inviterName = 'Someone';
        if (trip) {
          const { data: owner } = await supabase.from('trip_members').select('name').eq('trip_id', m.trip_id).eq('role', 'owner').single();
          if (owner) inviterName = owner.name;
        }
        enriched.push({
          ...m,
          color: m.color || '#5DCAA5',
          trip_name: trip?.name || 'Unknown Trip',
          trip_destination: trip?.destination || '',
          invited_by: inviterName,
        });
      }
      return enriched;
    },
    enabled: !!user?.email,
  });

  const acceptMutation = useMutation({
    mutationFn: async (invitation: Invitation) => {
      const { error } = await supabase
        .from('trip_members')
        .update({ user_id: user!.id })
        .eq('id', invitation.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['members'] });
      toast.success('You joined the trip!');
    },
    onError: () => toast.error('Failed to accept invitation'),
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trip_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation declined');
    },
    onError: () => toast.error('Failed to decline invitation'),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Mail className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Invitations</h2>
        {invitations.length > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {invitations.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No pending invitations</p>
          <p className="text-xs text-muted-foreground">When someone invites you to a trip, it will show up here.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {invitations.map((inv) => (
            <motion.div
              key={inv.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              className="bg-card border border-border rounded-lg p-4 mb-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: inv.color + '22' }}>
                  <MapPin className="w-4.5 h-4.5" style={{ color: inv.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{inv.trip_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {inv.trip_destination}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{inv.invited_by}</span> invited you as <span className="font-medium text-foreground">{inv.role}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => acceptMutation.mutate(inv)}
                    disabled={acceptMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" /> Join
                  </button>
                  <button
                    onClick={() => declineMutation.mutate(inv.id)}
                    disabled={declineMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-card border border-input rounded-md hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground transition-colors disabled:opacity-50"
                  >
                    <X className="w-3 h-3" /> Decline
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
