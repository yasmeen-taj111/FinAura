import React, { useEffect, useRef, useState } from 'react';
import { Bot, CornerDownLeft, RotateCcw, Send, Sparkles } from 'lucide-react';
import api from '../services/api';

const quickPrompts = ['Am I saving enough each month?', 'Explain the risks of a small-cap SIP.', 'Review my portfolio allocation.', 'Fact-check this social-media stock tip.'];
const welcomeMessage = () => ({ id: 'welcome', role: 'assistant', source: 'FinAura guide', text: 'Hi, I’m your FinAura assistant. Ask me about your budget, financial goals, virtual portfolio or investment risk.', timestamp: new Date() });

const inlineText = (text) => text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
  if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
  if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
  if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="rounded bg-brand-light px-1 py-0.5 text-xs">{part.slice(1, -1)}</code>;
  return part;
});

const tableCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
const isTableDivider = (line) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());

const MessageBody = ({ text, isUser }) => {
  if (isUser) return <p className="whitespace-pre-wrap" style={{ color: '#ffffff' }}>{text}</p>;
  const lines = text.split('\n');
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    // A Markdown table begins with a header followed by the --- separator row.
    if (trimmed.includes('|') && isTableDivider(lines[index + 1] || '')) {
      const headers = tableCells(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].trim().includes('|')) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      index -= 1;
      blocks.push(<div key={`table-${index}`} className="overflow-x-auto rounded-xl border border-brand-border"><table className="min-w-full border-collapse text-left text-xs leading-5"><thead className="bg-brand-light text-brand-primary"><tr>{headers.map((header, cellIndex) => <th key={cellIndex} className="whitespace-nowrap px-3 py-2 font-bold">{inlineText(header)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-brand-border align-top">{headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2">{inlineText(row[cellIndex] || '')}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (!trimmed) continue;
    if (/^#{1,3}\s/.test(trimmed)) blocks.push(<h3 key={index} className="pt-1 text-base font-bold text-brand-primary">{inlineText(trimmed.replace(/^#{1,3}\s*/, ''))}</h3>);
    else if (/^[-*]\s/.test(trimmed)) blocks.push(<div key={index} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" /><p>{inlineText(trimmed.replace(/^[-*]\s*/, ''))}</p></div>);
    else if (/^\d+\.\s/.test(trimmed)) blocks.push(<div key={index} className="flex gap-2"><span className="font-bold text-brand-primary">{trimmed.match(/^\d+\./)[0]}</span><p>{inlineText(trimmed.replace(/^\d+\.\s*/, ''))}</p></div>);
    else blocks.push(<p key={index}>{inlineText(trimmed)}</p>);
  }
  return <div className="space-y-2.5">{blocks}</div>;
};

const Assistant = () => {
  const [messages, setMessages] = useState([welcomeMessage()]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, isSending]);

  const sendMessage = async (preset) => {
    const message = (preset ?? input).trim();
    if (!message || isSending) return;
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', text: message, timestamp: new Date() }]);
    setInput(''); setError(''); setIsSending(true);
    try {
      const history = messages.slice(-8).map((item) => ({
        role: item.role === 'user' ? 'user' : 'assistant',
        content: item.text,
      }));
      // Groq can take longer than the default API timeout for richer responses.
      const { data } = await api.post('/assistant/chat', { message, history }, { timeout: 22000 });
      const reply = typeof data?.reply === 'string' && data.reply.trim() ? data.reply : 'I could not generate a response just now. Please try again.';
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', text: reply, source: data?.source || 'FinAura guide', timestamp: data?.timestamp ? new Date(data.timestamp) : new Date() }]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The assistant could not connect. Please try again.');
    } finally { setIsSending(false); }
  };

  const resetChat = () => { setMessages([welcomeMessage()]); setError(''); setInput(''); };

  return <main className="min-h-[calc(100vh-4rem)] bg-brand-bg px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border border-brand-border bg-white shadow-card">
      <header className="flex flex-col gap-4 border-b border-brand-border bg-gradient-to-r from-brand-light/70 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-primary shadow-sm" style={{ color: '#ffffff' }}><Bot size={21} color="#ffffff" /></span><div><p className="text-base font-bold text-brand-ink">FinAura Assistant</p><p className="mt-0.5 text-xs text-brand-muted">Personal finance guidance · Not investment advice</p></div></div>
        <button type="button" onClick={resetChat} className="inline-flex w-fit items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-brand-primary transition hover:bg-brand-light"><RotateCcw size={14} /> New chat</button>
      </header>
      <section aria-live="polite" className="flex min-h-[440px] flex-1 flex-col gap-5 overflow-y-auto bg-brand-bg/45 px-4 py-5 sm:px-7">
        <div className="rounded-2xl border border-brand-border bg-white p-4 text-sm leading-6 text-brand-muted sm:max-w-[78%]"><p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-brand-primary"><Sparkles size={13} /> Your money co-pilot</p>I use the information in your FinAura account when it is available, and explain ideas in clear, practical language.</div>
        {messages.map((item) => { const isUser = item.role === 'user'; return <article key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${isUser ? 'rounded-br-md bg-brand-primary' : 'rounded-bl-md border border-brand-border bg-white text-brand-ink'}`}><MessageBody text={item.text} isUser={isUser} /><p className={`mt-2 text-[10px] ${isUser ? '' : 'text-brand-muted'}`} style={isUser ? { color: 'rgba(255, 255, 255, 0.75)' } : undefined}>{!isUser && `${item.source} · `}{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></article>; })}
        {isSending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md border border-brand-border bg-white px-4 py-3 text-sm text-brand-muted">FinAura is thinking…</div></div>}
        {error && <p role="alert" className="rounded-xl border border-brand-danger/20 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">{error}</p>}<div ref={bottomRef} />
      </section>
      <footer className="border-t border-brand-border bg-white p-4 sm:px-6"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={isSending} className="shrink-0 rounded-full border border-brand-border px-3 py-1.5 text-[11px] font-semibold text-brand-primary transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50">{prompt}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex items-end gap-3"><textarea aria-label="Ask FinAura Assistant" rows="1" value={input} onChange={(event) => { setInput(event.target.value); event.currentTarget.style.height = 'auto'; event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`; }} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); sendMessage(); } }} placeholder="Ask anything about your money…" className="max-h-32 flex-1 resize-none rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" /><button type="submit" disabled={isSending || !input.trim()} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-primary text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Send size={18} color="#ffffff" /></button></form><p className="mt-2 flex items-center gap-1 text-[10px] text-brand-muted"><CornerDownLeft size={11} /> Cmd/Ctrl + Enter sends</p></footer>
    </div>
  </main>;
};

export default Assistant;
