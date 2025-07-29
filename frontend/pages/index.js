import Head from 'next/head';
import Chat from '../components/Chat';

/**
 * The home page renders the Chat component and sets basic metadata. The
 * application uses a max‑width container to center the chat on larger
 * displays while remaining fully responsive on mobile.
 */
export default function Home() {
  return (
    <>
      <Head>
        <title>Agent Floris</title>
        <meta name="description" content="A conversational AI powered by ElevenLabs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
        <Chat />
      </main>
    </>
  );
}