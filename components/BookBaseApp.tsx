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

// -------------------------
// WAGMI CONFIG
// -------------------------

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected({
 shimDisconnect: true 
}),
  ],
  ssr: false,
});

// -------------------------
// MAIN INNER APP
// -------------------------

function InnerApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, isPending } = useWriteContract();

  // --- types ---
  type Suggestion = {
    title: string;
    author: string;
    isbn?: string;
    coverUri?: string;
  };

  // -------------------------
  // STATE
  // -------------------------

  const [addr, setAddr] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [form, setForm] = useState({
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

  // -------------------------
  // INIT: LOAD SAVED CONTRACT
  // -------------------------

  useEffect(() => {
    const saved = window?.localStorage?.getItem('bookbase.addr.v2');
    if (saved) setAddr(saved);
  }, []);

  const saveAddr = () => {
    window.localStorage.setItem('bookbase.addr.v2', addr);
    alert('Saved');
  };

  // -------------------------
  // BOOK LOOKUP
  // -------------------------

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

      const items = (data.docs || []).slice(0, 5).map((b: any) => ({
        title: b.title || '',
        author: Array.isArray(b.author_name)
          ? b.author_name.join(', ')
          : (b.author_name || ''),

        isbn: Array.isArray(b.isbn) ? b.isbn[0] : b.isbn,

        coverUri: b.cover_i
          ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`
          : undefined,
      }));

      if (!items.length) alert('No results found.');

      setSuggestions(items);
    } catch (err) {
      console.error(err);
      alert('Lookup error.');
    } finally {
      setLookupLoading(false);
    }
  }

  const chooseSuggestion = (s: Suggestion) => {
    setForm((prev) => ({
      ...prev,
      title: s.title || prev.title,
      author: s.author || prev.author,
      isbn: s.isbn || prev.isbn,
      coverUri: s.coverUri || prev.coverUri,
    }));
    setSuggestions([]);
  };

  // -------------------------
  // WALLET
  // -------------------------

  const injectedConnector = connectors.find((c) => c.id === 'injected');

  async function handleConnect() {
    try {
      await window?.ethereum?.request?.({ method: 'eth_requestAccounts' });

      if (!injectedConnector)
        return alert('No browser wallet found. Install MetaMask or Rabby.');

      connect({ connector: injectedConnector });
    } catch (err) {
      console.error(err);
      alert('Wallet refused connection');
    }
  }

  // -------------------------
  // SUBMIT
  // -------------------------

  async function submit(e: any) {
    e.preventDefault();

    if (!addr) return alert('Paste deployed V2 contract address first');
    if (!isConnected || !address) return alert('Connect your wallet first');

    try {
      const finishedAt = form.finishedAt
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
  chain: base,        // wagmi v2 requirement
  account: address!,  // user wallet
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

  // -------------------------
  // FRAME URL
  // -------------------------

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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

  // -------------------------
  // RENDER
  // -------------------------

  return (
    <div className="c64-wrap">
      {/* TOP BAR */}
      <div className="c64-bar">
        <h1>BOOKBASE V2</h1>

        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <div>WALLET: {isConnected ? address : 'DISCONNECTED'}</div>

          {!isConnected ? (
            <button onClick={handleConnect} style={{ fontSize: 12, marginTop: 4 }}>
              CONNECT
            </button>
          ) : (
            <button onClick={() => disconnect()} style={{ fontSize: 12, marginTop: 4 }}>
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

      {/* CONTRACT ADDRESS */}
      <div style={{ marginTop: 8 }}>
        <label>CONTRACT ADDRESS (V2):&nbsp;</label>
        <input
          style={{ width: '60%' }}
          value={addr}
          onChange={(e) => setAddr(e.target.value.trim())}
          placeholder="0x..."
        />
        <button onClick={saveAddr} style={{ marginLeft: 8 }}>
          SAVE
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={submit}
        style={{ display: 'grid', gap: 8, marginTop: 16 }}
      >
        {/* Title + Lookup */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            required
            style={{ flex: 1, minWidth: 200 }}
            placeholder="TITLE"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <button
            type="button"
            onClick={lookupBook}
            disabled={lookupLoading}
          >
            {lookupLoading ? 'LOOKING…' : 'LOOK UP'}
          </button>
        </div>

        {/* Suggestions */}
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
                    width={36}
                    height={54}
                    style={{ objectFit: 'cover' }}
                    alt=""
                  />
                )}

                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700 }}>
                    {s.title || '(untitled)'}
                  </div>
                  <div style={{ opacity: 0.8 }}>{s.author}</div>
                  {s.isbn && (
                    <div style={{ opacity: 0.6, fontSize: 12 }}>
                      ISBN: {s.isbn}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remaining fields */}
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
          placeholder="TIME (e.g. Morning / Summer 2024)"
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

        <button type="submit" disabled={isPending}>
          {isPending ? 'MINTING…' : 'LOG BOOK & MINT BADGE (V2)'}
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
