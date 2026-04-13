import { finlandProvider } from "@/lib/providers/finlandProvider";
import { hongKongProvider } from "@/lib/providers/hongKongProvider";
import { mockProvider } from "@/lib/providers/mockProvider";
import { singaporeProvider } from "@/lib/providers/singaporeProvider";
import { CameraProvider } from "@/lib/providers/types";

const realProviders: CameraProvider[] = [
  hongKongProvider,
  finlandProvider,
  singaporeProvider,
];

export function getProviderRegistry(): CameraProvider[] {
  const liveProvidersEnabled = process.env.ENABLE_REAL_PROVIDERS === "true";

  if (!liveProvidersEnabled) {
    return [mockProvider, ...realProviders];
  }

  const activeLiveProviders = realProviders.filter((provider) => provider.meta.enabled);

  return activeLiveProviders.length > 0
    ? [mockProvider, ...activeLiveProviders]
    : [mockProvider, ...realProviders];
}
