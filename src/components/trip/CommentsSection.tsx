import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/lib/types';
import { useCreateComment } from '@/hooks/useTripData';
import { useAuth } from '@/hooks/useAuth';

interface Props { tripId: string; comments: Comment[]; }

export default function CommentsSection({ tripId, comments }: Props) {
  const [text, setText] = useState('');
  const createComment = useCreateComment();
  const { user } = useAuth();

  const handlePost = () => {
    if (!text.trim() || !user) return;
    createComment.mutate({
      trip_id: tripId,
      user_id: user.id,
      author_name: user.email?.split('@')[0] || 'Anonymous',
      text: text.trim(),
    });
    setText('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-[13px] font-medium text-foreground mb-4">Trip comments</p>

        <div className="space-y-3 mb-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-medium shrink-0">
                {c.author_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-secondary rounded-lg px-3 py-2.5">
                <p className="text-xs font-medium text-foreground">{c.author_name}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{c.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No comments yet</p>}
        </div>

        <div className="flex gap-2 items-center">
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-medium shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-[13px] border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handlePost}
            disabled={!text.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
