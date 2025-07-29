import '../styles/globals.css';

/**
 * The custom App component makes it possible to persist layout or state
 * across page transitions. Here we simply include the global CSS once and
 * render the requested page.
 */
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}