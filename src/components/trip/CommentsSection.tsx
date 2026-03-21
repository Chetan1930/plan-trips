import { useState, useEffect, useRef } from 'react';
import { Send, Users, Plus, SmilePlus, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import type { Comment, TripMember } from '@/lib/types';
import { useCreateComment } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  tripId: string;
  comments: Comment[];
  members: TripMember[];
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function groupByDate(comments: Comment[]) {
  const groups: { label: string; messages: Comment[] }[] = [];
  let currentLabel = '';
  for (const c of comments) {
    const label = getDateLabel(c.created_at);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [c] });
    } else {
      groups[groups.length - 1].messages.push(c);
    }
  }
  return groups;
}

export default function CommentsSection({ tripId, comments: initialComments, members }: Props) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Comment[]>(initialComments);
  const [showMembers, setShowMembers] = useState(false);
  const createComment = useCreateComment();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with parent data
  useEffect(() => {
    setMessages(initialComments);
  }, [initialComments]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${tripId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `trip_id=eq.${tripId}`,
      }, (payload) => {
        const newMsg = payload.new as Comment;
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePost = () => {
    if (!text.trim() || !user) return;
    createComment.mutate({
      trip_id: tripId,
      user_id: user.id,
      author_name: user.email?.split('@')[0] || 'Anonymous',
      text: text.trim(),
    });
    setText('');
    inputRef.current?.focus();
  };

  const dateGroups = groupByDate(messages);
  const onlineMembers = members.filter(m => m.user_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-120px)] flex gap-3"
    >
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Trip Discussion</p>
              <p className="text-[11px] text-muted-foreground">
                {members.length} member{members.length !== 1 ? 's' : ''} · {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${showMembers ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{members.length}</span>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <SmilePlus className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Start the conversation!</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Discuss trip plans, share ideas, and coordinate with your group.
              </p>
            </div>
          ) : (
            dateGroups.map((group, gi) => (
              <div key={gi}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {group.messages.map((msg, mi) => {
                  const isOwn = msg.user_id === user?.id;
                  const prevMsg = mi > 0 ? group.messages[mi - 1] : null;
                  const isConsecutive = prevMsg?.user_id === msg.user_id;
                  const memberColor = members.find(m => m.user_id === msg.user_id)?.color || 'hsl(var(--primary))';

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}
                    >
                      {/* Avatar */}
                      {!isConsecutive ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-primary-foreground shrink-0 shadow-sm"
                          style={{ background: memberColor }}
                        >
                          {msg.author_name[0]?.toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      {/* Bubble */}
                      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isConsecutive && (
                          <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-semibold text-foreground">{msg.author_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </span>
                          </div>
                        )}
                        <div
                          className={`px-3.5 py-2 text-[13px] leading-relaxed rounded-2xl
                            ${isOwn
                              ? 'bg-primary text-primary-foreground rounded-tr-md'
                              : 'bg-secondary text-foreground rounded-tl-md'
                            }
                            ${isConsecutive && isOwn ? 'rounded-tr-2xl' : ''}
                            ${isConsecutive && !isOwn ? 'rounded-tl-2xl' : ''}
                          `}
                        >
                          {msg.text}
                        </div>
                        {isConsecutive && (
                          <p className={`text-[9px] text-muted-foreground mt-0.5 ${isOwn ? 'text-right' : ''}`}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-1.5">
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5"
            />
            <button
              onClick={handlePost}
              disabled={!text.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 240 }}
            exit={{ opacity: 0, width: 0 }}
            className="bg-card border border-border rounded-xl overflow-hidden shrink-0"
          >
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Members</p>
            </div>
            <ScrollArea className="h-[calc(100%-44px)]">
              <div className="p-2 space-y-0.5">
                {/* Online / linked members */}
                {onlineMembers.length > 0 && (
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Linked — {onlineMembers.length}
                  </p>
                )}
                {onlineMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                        style={{ background: m.color }}
                      >
                        {m.initials}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{m.role}</p>
                    </div>
                  </div>
                ))}

                {/* Pending / not linked */}
                {members.filter(m => !m.user_id).length > 0 && (
                  <>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">
                      Pending — {members.filter(m => !m.user_id).length}
                    </p>
                    {members.filter(m => !m.user_id).map(m => (
                      <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-60">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                          style={{ background: m.color }}
                        >
                          {m.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{m.email || 'Invited'}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
