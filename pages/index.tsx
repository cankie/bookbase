import dynamic from 'next/dynamic';

// Dynamically load the BookBaseApp client-only component.
// ssr: false means "do not try to render this on the server".
const BookBaseApp = dynamic(() => import('../components/BookBaseApp'), {
  ssr: false,
});

export default function HomePage() {
  return <BookBaseApp />;
}
