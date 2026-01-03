import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { AIGenerationProvider } from "../context/AIGenerationContext";
import GlobalAIModal, { AIGenerationIndicator } from "../components/GlobalAIModal";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <AIGenerationProvider>
        <Component {...pageProps} />
        <GlobalAIModal />
        <AIGenerationIndicator />
        <Analytics />
      </AIGenerationProvider>
    </SessionProvider>
  );
}
