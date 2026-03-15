"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "./onboarding-flow";

export function OnboardingGate() {
  const [done, setDone] = useState(false);
  const router = useRouter();

  function handleComplete() {
    setDone(true);
    router.refresh();
  }

  if (done) return null;

  return <OnboardingFlow onComplete={handleComplete} />;
}
