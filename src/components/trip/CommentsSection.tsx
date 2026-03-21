import { useState, useEffect, useRef } from 'react';
import { Send, Users, SmilePlus, Hash, Paperclip, X, FileIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import type { Comment, TripMember } from '@/lib/types';
import { useCreateComment } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [messages, setMessages] = useState<Comment[]>(initialComments);
  const [showMembers, setShowMembers] = useState(false);
  const createComment = useCreateComment();
  const { user } = useAuth();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePost = async () => {
    if ((!text.trim() && !selectedFile) || !user) return;
    
    let attachmentUrl = null;
    let attachmentType = null;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${tripId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('trip_attachments')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('trip_attachments').getPublicUrl(fileName);
        attachmentUrl = data.publicUrl;
        attachmentType = selectedFile.type;
        
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload file');
        setIsUploading(false);
        return;
      }
    }

    createComment.mutate({
      trip_id: tripId,
      user_id: user.id,
      author_name: user.email?.split('@')[0] || 'Anonymous',
      text: text.trim(),
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
    }, {
      onSuccess: () => {
        setText('');
        setSelectedFile(null);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        inputRef.current?.focus();
      },
      onError: (err: any) => {
        // Show the ACTUAL database error to the user
        toast.error(err.message || 'Failed to send message');
        setIsUploading(false);
      }
    });
  };

  const dateGroups = groupByDate(messages);
  const onlineMembers = members.filter(m => m.user_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-[120px])] md:h-[calc(100vh-120px)] flex flex-row gap-3 relative"
    >
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden relative z-10">
        {/* Chat Header */}
        <div className="px-3 md:px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Trip Discussion</p>
              <p className="text-[11px] text-muted-foreground">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${showMembers ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Users className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">{members.length}</span>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-1">
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
                  const isImage = msg.attachment_type?.startsWith('image/');

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
                      <div className={`max-w-[85%] sm:max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isConsecutive && (
                          <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-semibold text-foreground">{msg.author_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex flex-col gap-1.5 px-3.5 py-2 text-[13px] leading-relaxed rounded-2xl break-words
                            ${isOwn
                              ? 'bg-primary text-primary-foreground rounded-tr-md'
                              : 'bg-secondary text-foreground rounded-tl-md'
                            }
                            ${isConsecutive && isOwn ? 'rounded-tr-2xl' : ''}
                            ${isConsecutive && !isOwn ? 'rounded-tl-2xl' : ''}
                          `}
                        >
                          {msg.attachment_url && (
                            <div className="mt-0.5">
                              {isImage ? (
                                <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                  <img 
                                    src={msg.attachment_url} 
                                    alt="attachment" 
                                    className="max-w-full sm:max-w-[280px] max-h-[200px] rounded-lg object-cover bg-black/10" 
                                  />
                                </a>
                              ) : (
                                <a 
                                  href={msg.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                    ${isOwn ? 'bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground' : 'bg-background hover:bg-muted text-foreground border border-border'}`}
                                >
                                  <FileIcon className="w-4 h-4" />
                                  <span>View attachment</span>
                                </a>
                              )}
                            </div>
                          )}
                          {msg.text && <span>{msg.text}</span>}
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
        <div className="px-3 md:px-4 py-3 border-t border-border shrink-0 bg-card">
          {/* File Preview before upload */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-xs border border-border">
                  {selectedFile.type.startsWith('image/') ? (
                    <div className="w-6 h-6 rounded bg-muted overflow-hidden">
                      <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <FileIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="max-w-[150px] truncate font-medium">{selectedFile.name}</span>
                  <button 
                    onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="ml-1 p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 bg-secondary rounded-xl pl-2 pr-1.5 py-1.5 border border-transparent focus-within:border-border transition-colors">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0 mb-[3px]"
            >
              <Paperclip className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>

            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
              placeholder="Message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2 min-h-[36px] max-h-[100px] resize-none overflow-y-auto leading-relaxed"
              rows={1}
            />
            
            <button
              onClick={handlePost}
              disabled={(!text.trim() && !selectedFile) || isUploading}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0 mb-[1px]"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile background overlay when members drawer is open */}
      <AnimatePresence>
        {showMembers && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="md:hidden absolute inset-0 bg-background/50 backdrop-blur-sm z-20 rounded-xl"
            onClick={() => setShowMembers(false)}
          />
        )}
      </AnimatePresence>

      {/* Members Sidebar (Floating on Mobile) */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-0 top-0 bottom-0 w-[240px] z-30 md:relative bg-card border-l border-border rounded-r-xl md:rounded-xl overflow-hidden shrink-0 shadow-2xl md:shadow-none"
          >
            <div className="p-3 border-b border-border flex justify-between items-center">
              <p className="text-xs font-semibold text-foreground">Members</p>
              <button className="md:hidden p-1 rounded-md hover:bg-muted text-muted-foreground" onClick={() => setShowMembers(false)}>
                <X className="w-3.5 h-3.5" />
              </button>
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
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
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