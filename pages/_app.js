import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { AIGenerationProvider } from "../context/AIGenerationContext";
import GlobalAIModal, { AIGenerationIndicator } from "../components/GlobalAIModal";
import ReferralTracker from "../components/ReferralTracker";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <AIGenerationProvider>
        <ReferralTracker />
        <Component {...pageProps} />
        <GlobalAIModal />
        <AIGenerationIndicator />
        <Analytics />
      </AIGenerationProvider>
    </SessionProvider>
  );
}
