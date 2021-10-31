import type { AppProps } from 'next/app';

import { ChatProvider } from '../components';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <Component {...pageProps} />
    </ChatProvider>
  );
}

export default MyApp;
