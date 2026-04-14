import { finlandProvider } from "@/lib/providers/finlandProvider";
import { hongKongProvider } from "@/lib/providers/hongKongProvider";
import { mockProvider } from "@/lib/providers/mockProvider";
import { ohgoProvider } from "@/lib/providers/ohgoProvider";
import { singaporeProvider } from "@/lib/providers/singaporeProvider";
import { CameraProvider } from "@/lib/providers/types";
import { windyProvider } from "@/lib/providers/windyProvider";

const realProviders: CameraProvider[] = [
  hongKongProvider,
  finlandProvider,
  singaporeProvider,
  ohgoProvider,
  windyProvider,
];

export function getProviderRegistry(): CameraProvider[] {
  const liveProvidersEnabled = process.env.ENABLE_REAL_PROVIDERS === "true";

  if (!liveProvidersEnabled) {
    return [mockProvider, ...realProviders];
  }

  const activeLiveProviders = realProviders.filter((provider) => provider.meta.enabled);

  return activeLiveProviders.length > 0 ? activeLiveProviders : [mockProvider];
}
