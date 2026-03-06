"use client";

import { DesignAgency } from "@/components/ui/landing-page";
import CookieConsent from "@/components/ui/cookies-banner";

export default function Home() {
  return (
    <>
      <DesignAgency />
      <CookieConsent privacyHref="/privacy-policy" />
    </>
  );
}
