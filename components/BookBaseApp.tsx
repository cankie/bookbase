'use client';

import { useEffect, useState } from 'react';
import {
  WagmiConfig,
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { base, baseSepolia } from 'wagmi/chains';

import abi from './BookBadgeV2Abi';

const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [
    injected({
      target: 'injected',
      shimDisconnect: true,
    }),
  ],
  ssr: false,
});

function InnerApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, isPending } = useWriteContract();

  // --- types & state ---

  type Suggestion = {
    title: string;
    author: string;
    isbn?: string;
    coverUri?: string;
  };

  // contract address (you SAVE it in the UI)
  const [addr, setAddr] = useState('');

  // book metadata (with V2 fields)
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    coverUri: '',     // from lookup
    finishedAt: '',   // date input → unix

    // V2 additions:
    place: '',
    mood: '',
    timeLabel: '',
    fragment: '',
    photoUri: '',
  });

  // lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // load saved contract address
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('bookbase.addr.v2');
      if (saved) setAddr(saved);
    }
  }, []);

  const save = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bookbase.addr.v2', addr);
      alert('Saved');
    }
  };

  // ------------- LOOKUP HANDLERS -------------

  async function lookupBook() {
    const q = form.title.trim();
    if (!q) return alert('Type a title first');

    setLookupLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=10`
      );
      if (!res.ok) throw new Error('Lookup failed');

      const data = await res.json();

      const items: Suggestion[] = (data.docs || []).slice(0, 5).map((b: any) => {
        const authorGuess = Array.isArray(b.author_name)
          ? b.author_name.join(', ')
          : (b.author_name || '');

        const isbnGuess = Array.isArray(b.isbn)
          ? b.isbn[0]
          : b.isbn;

        const coverGuess = b.cover_i
          ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`
          : undefined;

        return {
          title: b.title || '',
          author: authorGuess || '',
          isbn: isbnGuess || '',
          coverUri: coverGuess,
        };
      });

      if (items.length === 0) {
        alert('No results found.');
      }

      setSuggestions(items);
    } catch (e) {
      console.error(e);
      alert('Lookup error.');
    } finally {
      setLookupLoading(false);
    }
  }

  function chooseSuggestion(s: Suggestion) {
    setForm((prev) => ({
      ...prev,
      title: s.title || prev.title,
      author: s.author || prev.author,
      isbn: s.isbn || prev.isbn,
      coverUri: s.coverUri || prev.coverUri,
    }));
    setSuggestions([]);
  }

  // ------------- WALLET CONNECT -------------

  const injectedConnector = connectors.find((c) => c.id === 'injected');

  async function handleConnect() {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request?.({ method: 'eth_requestAccounts' });
      }
      if (!injectedConnector) {
        return alert('No browser wallet found. Install MetaMask or Rabby.');
      }
      connect({ connector: injectedConnector });
    } catch (err) {
      console.error(err);
      alert('Wallet refused connection');
    }
  }

  // ------------- SUBMIT TO CONTRACT -------------

  async function submit(e: any) {
    e.preventDefault();
    if (!addr) return alert('Paste deployed V2 contract address first');
    if (!isConnected || !address) return alert('Connect your wallet first');

    try {
      const finishedAt =
        form.finishedAt
          ? BigInt(Math.floor(new Date(form.finishedAt).getTime() / 1000))
          : 0n;

      const tx = await writeContractAsync({
        address: addr as `0x${string}`,
        abi,
        functionName: 'logBook',
        args: [
          form.title,
          form.author,
          form.isbn,
          form.place,
          form.mood,
          form.timeLabel,
          form.fragment,
          form.photoUri,
          form.coverUri,
          finishedAt,
        ],
      });

      console.log('tx sent', tx);
      alert('Submitted! Check your wallet / explorer.');

      setForm({
        title: '',
        author: '',
        isbn: '',
        coverUri: '',
        finishedAt: '',
        place: '',
        mood: '',
        timeLabel: '',
        fragment: '',
        photoUri: '',
      });
      setSuggestions([]);
    } catch (err: any) {
      console.error(err);
      alert(err?.shortMessage || err?.message || 'Transaction failed');
    }
  }

  // ------------- FRAME URL -------------

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const frameUrl = `${baseUrl}/api/frames`;

  const moodOptions = [
    '',
    'Peaceful',
    'Curious',
    'Heartbroken',
    'Inspired',
    'Cozy',
    'Mind-blown',
    'Anxious',
    'Nostalgic',
  ];

  // ------------- RENDER -------------

  return (
    <div className="c64-wrap">
      <div className="c64-bar">
        <h1>BOOKBASE V2</h1>
        <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: 1.4 }}>
          <div>WALLET: {isConnected && address ? address : 'DISCONNECTED'}</div>
          {!isConnected ? (
            <button
              type="button"
              onClick={handleConnect}
              style={{ fontSize: '12px', marginTop: 4, cursor: 'pointer' }}
            >
              CONNECT
            </button>
          ) : (
            <button
              type="button"
              onClick={() => disconnect()}
              style={{ fontSize: '12px', marginTop: 4, cursor: 'pointer' }}
            >
              DISCONNECT
            </button>
          )}
        </div>
      </div>

      <p className="c64-mono">
        READY.<span className="c64-caret" />
      </p>

      <div className="c64-block">
        <b>FRAME URL</b>
        <code>{frameUrl}</code>
      </div>

      <hr />

      <div style={{ marginTop: 8 }}>
        <label>CONTRACT ADDRESS (V2):&nbsp;</label>
        <input
          style={{ width: '60%' }}
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="0x..."
        />
        <button onClick={save} style={{ marginLeft: 8 }}>
          SAVE
        </button>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        {/* Title + Lookup */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            required
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="TITLE"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <button
            type="button"
            onClick={lookupBook}
            disabled={lookupLoading}
            style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            {lookupLoading ? 'LOOKING…' : 'LOOK UP'}
          </button>
        </div>

        {/* Suggestions list (click to fill) */}
        {suggestions.length > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              border: '1px dashed #5af',
              background: 'rgba(0,0,64,0.3)',
            }}
          >
            <div style={{ marginBottom: 6, opacity: 0.8 }}>
              Suggestions (click to fill):
            </div>
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => chooseSuggestion(s)}
                style={{
                  padding: '6px 8px',
                  marginBottom: 6,
                  cursor: 'pointer',
                  border: '1px solid #345',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                {s.coverUri && (
                  <img
                    src={s.coverUri}
                    alt=""
                    width={36}
                    height={54}
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700 }}>{s.title || '(untitled)'}</div>
                  <div style={{ opacity: 0.8 }}>{s.author || 'Unknown author'}</div>
                  {s.isbn && (
                    <div style={{ opacity: 0.6, fontSize: 12 }}>ISBN: {s.isbn}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rest of form fields */}
        <input
          required
          placeholder="AUTHOR"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />

        <input
          placeholder="ISBN (OPTIONAL)"
          value={form.isbn}
          onChange={(e) => setForm({ ...form, isbn: e.target.value })}
        />

        <input
          placeholder="COVER URI (OPTIONAL)"
          value={form.coverUri}
          onChange={(e) => setForm({ ...form, coverUri: e.target.value })}
        />

        <input
          type="date"
          placeholder="FINISHED DATE"
          value={form.finishedAt}
          onChange={(e) => setForm({ ...form, finishedAt: e.target.value })}
        />

        <input
          placeholder="PLACE (Home, Plane, Park)"
          value={form.place}
          onChange={(e) => setForm({ ...form, place: e.target.value })}
        />

        <select
          value={form.mood}
          onChange={(e) => setForm({ ...form, mood: e.target.value })}
        >
          {moodOptions.map((m) => (
            <option key={m} value={m}>
              {m || 'MOOD (optional)'}
            </option>
          ))}
        </select>

        <input
          placeholder='TIME (e.g., "Morning", "Summer 2024", "Midnight")'
          value={form.timeLabel}
          onChange={(e) => setForm({ ...form, timeLabel: e.target.value })}
        />

        <textarea
          placeholder="FRAGMENT (quote/thought)"
          value={form.fragment}
          onChange={(e) => setForm({ ...form, fragment: e.target.value })}
        />

        <input
          placeholder="PHOTO URL (optional)"
          value={form.photoUri}
          onChange={(e) => setForm({ ...form, photoUri: e.target.value })}
        />

        <button type="submit" disabled={isPending} style={{ cursor: 'pointer' }}>
          {isPending ? 'MINTING...' : 'LOG BOOK & MINT BADGE (V2)'}
        </button>
      </form>
    </div>
  );
}

export default function BookBaseApp() {
  return (
    <WagmiConfig config={config}>
      <InnerApp />
    </WagmiConfig>
  );
}
