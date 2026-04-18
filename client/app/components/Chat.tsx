'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
  id?: string;
}
interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const { getToken } = useAuth();
  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  const handleSendChatMessage = async () => {
    if (!message.trim() || isLoading) {
      return;
    }

    const pendingMessage = message;
    setMessage('');
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: pendingMessage }]);

    try {
      const data = await apiClient.chat(pendingMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.message,
          documents: data?.docs,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong while contacting the server.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='h-full flex flex-col'>
      <div className='sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur px-4 py-3 md:px-6'>
        <h2 className='text-sm md:text-base font-semibold tracking-wide text-zinc-100'>
          Ask About Your PDF
        </h2>
        <p className='text-xs text-zinc-400'>
          Ask questions and review the extracted document chunks.
        </p>
      </div>

      <div className='flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-4'>
        {messages.length === 0 ? (
          <div className='rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-300'>
            No messages yet. Ask something like: What is this project about?
          </div>
        ) : null}

        {messages.map((entry, index) => (
          <article key={index} className='space-y-2'>
            <div
              className={`max-w-[92%] rounded-xl border px-3 py-2 text-sm whitespace-pre-wrap ${
                entry.role === 'user'
                  ? 'ml-auto border-zinc-600 bg-zinc-800 text-zinc-100'
                  : 'mr-auto border-zinc-800 bg-zinc-900/80 text-zinc-200'
              }`}
            >
              {entry.content}
            </div>

            {entry.role === 'assistant' && entry.documents && entry.documents.length > 0 ? (
              <details className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-3'>
                <summary className='cursor-pointer text-xs uppercase tracking-wider text-zinc-400'>
                  Retrieved Documents ({entry.documents.length})
                </summary>
                <div className='mt-3 space-y-2'>
                  {entry.documents.map((doc, docIndex) => (
                    <details
                      key={doc.id ?? `${index}-${docIndex}`}
                      className='rounded-md border border-zinc-800 bg-zinc-950/70 p-2'
                    >
                      <summary className='cursor-pointer text-[11px] text-zinc-300'>
                        Page {doc.metadata?.loc?.pageNumber ?? '-'} -{' '}
                        {doc.metadata?.source ?? 'Unknown source'}
                      </summary>
                      <p className='mt-2 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap'>
                        {doc.pageContent?.trim() || 'No preview available'}
                      </p>
                    </details>
                  ))}
                </div>
              </details>
            ) : null}
          </article>
        ))}

        {isLoading ? (
          <article className='space-y-2'>
            <div className='mr-auto max-w-[92%] rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300'>
              <div className='inline-flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-zinc-400 animate-pulse' />
                <span className='h-2 w-2 rounded-full bg-zinc-400 animate-pulse [animation-delay:120ms]' />
                <span className='h-2 w-2 rounded-full bg-zinc-400 animate-pulse [animation-delay:240ms]' />
                <span className='text-xs text-zinc-400'>AI is responding...</span>
              </div>
            </div>
          </article>
        ) : null}
      </div>

      <div className='sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur p-4 md:p-6'>
        <form
          className='flex gap-2'
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChatMessage();
          }}
        >
          <Input
            placeholder='Type your message here'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500'
          />
          <Button
            type='submit'
            onClick={handleSendChatMessage}
            disabled={!message.trim() || isLoading}
            className='bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ChatComponent;
