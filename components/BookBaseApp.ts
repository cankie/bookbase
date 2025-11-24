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

import abi from '../abis/BookBadgeV2';

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

  // LOOKUP: Open Library (fills author, isbn, cover)
  async function lookupBook() {
    const q = form.title.trim();
    if (!q) return alert('Type a title first');
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}`
      );
      if (!res.ok) return alert('Lookup failed.');
      const data = await res.json();
      if (!data.docs || data.docs.length === 0) {
        return alert('No results found.');
      }
      const book = data.docs[0];
      const authorGuess = Array.isArray(book.author_name)
        ? book.author_name.join(', ')
        : book.author_name || '';
      const isbnGuess = Array.isArray(book.isbn) ? book.isbn[0] : book.isbn || '';
      let coverGuess = '';
      if (book.cover_i) {
        coverGuess = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
      }
      setForm((prev) => ({
        ...prev,
        author: authorGuess || prev.author,
        isbn: isbnGuess || prev.isbn,
        coverUri: coverGuess || prev.coverUri,
      }));
      alert('Filled from Open Library.');
    } catch (e) {
      console.error(e);
      alert('Lookup error.');
    }
  }

  // connect button helper
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

  // submit to V2 contract
  async function submit(e: any) {
    e.preventDefault();
    if (!addr) return alert('Paste deployed V2 contract address first');
    if (!isConnected || !address) return alert('Connect your wallet first');

    try {
      const finishedAt =
        form.finishedAt ? BigInt(Math.floor(new Date(form.finishedAt).getTime() / 1000)) : 0n;

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
    } catch (err: any) {
      console.error(err);
      alert(err?.shortMessage || err?.message || 'Transaction failed');
    }
  }

  const baseUrl =
    (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) ||
    'http://localhost:3000';
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
          <button type="button" onClick={lookupBook} style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
            LOOK UP
          </button>
        </div>

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

        {/* V2 Fields */}
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
          placeholder='FRAGMENT (quote/thought)'
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
