import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import StripeProvider from "../components/StripeProvider";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <StripeProvider>
        <Component {...pageProps} />
        <Analytics />
      </StripeProvider>
    </SessionProvider>
  );
}
