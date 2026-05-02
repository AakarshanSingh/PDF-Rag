'use client';

import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { useAuthStore } from '../store/authStore';
import { createApiClient } from '@/lib/api';
import { ArrowUp, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Doc {
  pageContent?: string;
  metadata?: { loc?: { pageNumber?: number }; source?: string };
  id?: string;
}
interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const DocItem = memo(({ doc, idx }: { doc: Doc; idx: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className='overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/70'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='flex w-full items-center gap-2 bg-zinc-900/70 px-3 py-2 text-left transition-colors hover:bg-zinc-900'
      >
        <FileText className='h-3.5 w-3.5 text-zinc-500' />
        <span className='flex-1 text-[11px] text-zinc-400'>
          Page {doc.metadata?.loc?.pageNumber ?? idx + 1}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className='m-0 max-h-40 overflow-y-auto whitespace-pre-wrap wrap-break-word bg-zinc-950 px-3 py-2 text-[11px] leading-relaxed text-zinc-400'>
          {doc.pageContent?.trim() || 'No preview available'}
        </p>
      )}
    </div>
  );
});
DocItem.displayName = 'DocItem';

const SourceDocs = memo(({ docs }: { docs: Doc[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className='mt-2 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/30'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='flex w-full items-center gap-2 bg-zinc-900/70 px-3 py-2 transition-colors hover:bg-zinc-900'
      >
        <FileText className='h-3.5 w-3.5 text-zinc-500' />
        <span className='flex-1 text-left text-[11px] text-zinc-400'>
          {docs.length} source{docs.length !== 1 ? 's' : ''}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className='flex flex-col gap-2 bg-zinc-950/70 p-2.5'>
          {docs.map((doc, i) => (
            <DocItem key={doc.id ?? i} doc={doc} idx={i} />
          ))}
        </div>
      )}
    </div>
  );
});
SourceDocs.displayName = 'SourceDocs';

const Message = memo(({ entry }: { entry: IMessage }) => {
  if (entry.role === 'user') {
    return (
      <div className='flex justify-end'>
        <div className='max-w-[78%] whitespace-pre-wrap wrap-break-word rounded-2xl rounded-br-md border border-zinc-700/80 bg-zinc-800 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-100'>
          {entry.content}
        </div>
      </div>
    );
  }
  return (
    <div className='max-w-[84%]'>
      <p className='m-0 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-zinc-300'>
        {entry.content}
      </p>
      {entry.documents && entry.documents.length > 0 && (
        <SourceDocs docs={entry.documents} />
      )}
    </div>
  );
});
Message.displayName = 'Message';

const TypingDots = memo(() => (
  <div className='flex gap-1.5 py-1'>
    {([0, 120, 240] as const).map((d) => (
      <span
        key={d}
        className='inline-block h-1.5 w-1.5 rounded-full bg-zinc-500'
        style={{ animation: `dotPulse 1.2s ease-in-out ${d}ms infinite` }}
      />
    ))}
  </div>
));
TypingDots.displayName = 'TypingDots';

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgCount = messages.length;

  const { token } = useAuthStore();
  const apiClient = useMemo(() => createApiClient(async () => token), [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgCount, isLoading]);

  const handleSend = useCallback(async () => {
    const text = message.trim();
    if (!text || isLoading) return;
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    try {
      const data = await apiClient.chat(text);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.message, documents: data?.docs },
      ]);
    } catch {
      toast.error('Something went wrong. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, apiClient]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    },
    [],
  );

  const userCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );

  return (
    <section className='flex h-full flex-col bg-zinc-950'>
      <style>{`
        @keyframes dotPulse {
          0%,80%,100%{opacity:.3;transform:scale(.85)}
          40%{opacity:1;transform:scale(1)}
        }
        .msg-in{animation:msgIn .2s cubic-bezier(.16,1,.3,1) both}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .send-btn:not(:disabled):active{transform:scale(.96)}
        .msgs-scroll{scrollbar-width:thin;scrollbar-color:#27272a transparent}
        .msgs-scroll::-webkit-scrollbar{width:4px}
        .msgs-scroll::-webkit-scrollbar-track{background:transparent}
        .msgs-scroll::-webkit-scrollbar-thumb{background:#27272a;border-radius:99px}
      `}</style>

      <div className='flex shrink-0 items-center border-b border-zinc-800/80 px-5 py-3.5'>
        <span className='text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500'>
          PDF Chat
        </span>
        {userCount > 0 && (
          <span className='ml-auto rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-500'>
            {userCount} msg{userCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div
        className='msgs-scroll flex-1 overflow-y-auto px-5 py-6'
        style={{ WebkitOverflowScrolling: 'touch' as any }}
      >
        {msgCount === 0 && (
          <div className='m-auto flex flex-col items-center gap-3 text-center'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900'>
              <FileText className='h-5 w-5 text-zinc-500' />
            </div>
            <div>
              <p className='mb-2 text-sm font-medium text-zinc-300'>
                Ask anything about your PDF
              </p>
              <p className='text-sm leading-relaxed text-zinc-500'>
                Try "Summarize this document" or
                <br />
                "What are the key takeaways?"
              </p>
            </div>
          </div>
        )}
        <div className='flex flex-col gap-5'>
          {messages.map((entry, i) => (
            <div key={i} className='msg-in'>
              <Message entry={entry} />
            </div>
          ))}
          {isLoading && (
            <div className='msg-in'>
              <TypingDots />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className='shrink-0 border-t border-zinc-800/80 px-4 pb-4 pt-3'>
        <div className='flex justify-center items-center gap-2 rounded-xl'>
          <Textarea
            ref={textareaRef}
            className='flex-1 max-h-40 min-h-10 resize-none border-0 bg-transparent text-sm leading-6 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0'
            rows={1}
            placeholder='Ask something about your PDF...'
            value={message}
            disabled={isLoading}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size='icon'
            variant='secondary'
            type='button'
            className='h-10 w-10 shrink-0 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600'
          >
            <ArrowUp className='h-4 w-4' />
          </Button>
        </div>

        <p className='mt-2 text-center text-[11px] text-zinc-600'>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </section>
  );
};

export default ChatComponent;
