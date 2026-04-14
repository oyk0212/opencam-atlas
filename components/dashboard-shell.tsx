"use client";

import { useMemo, useState, useEffect } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { CameraCard } from "@/components/camera-card";
import { EmptyState } from "@/components/empty-state";
import { CameraMap } from "@/components/map/camera-map";
import { Camera, CameraFilterOptions, CameraProviderMeta } from "@/lib/providers/types";

type ViewMode = "grid" | "map";

interface DashboardShellProps {
  cameras: Camera[];
  filterOptions: CameraFilterOptions;
  popularTags: Array<[string, number]>;
  trending: Camera[];
  stats: {
    total: number;
    online: number;
    countries: number;
    providers: number;
    withStreams: number;
  };
  providers: CameraProviderMeta[];
  initialFilters: Record<string, string | undefined>;
}

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("opencam-favorites");
    if (raw) {
      try {
        setFavorites(JSON.parse(raw));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const toggle = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];

      window.localStorage.setItem("opencam-favorites", JSON.stringify(next));
      return next;
    });
  };

  return { favorites, toggle };
}

export function DashboardShell({
  cameras,
  filterOptions,
  popularTags,
  trending,
  stats,
  providers,
  initialFilters,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { favorites, toggle } = useFavorites();

  const [search, setSearch] = useState(initialFilters.q ?? "");
  const [country, setCountry] = useState(initialFilters.country ?? "");
  const [city, setCity] = useState(initialFilters.city ?? "");
  const [category, setCategory] = useState(initialFilters.category ?? "");
  const [provider, setProvider] = useState(initialFilters.provider ?? "");
  const [media, setMedia] = useState(initialFilters.media ?? "");
  const [favoritesOnly, setFavoritesOnly] = useState(initialFilters.favorites === "1");
  const [view, setView] = useState<ViewMode>(
    (initialFilters.view as ViewMode | undefined) ??
      ((process.env.NEXT_PUBLIC_DEFAULT_VIEW as ViewMode | undefined) ?? "grid"),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (provider) params.set("provider", provider);
    if (media) params.set("media", media);
    if (favoritesOnly) params.set("favorites", "1");
    if (view !== "grid") params.set("view", view);

    const query = params.toString();
    const nextHref = (query ? `${pathname}?${query}` : pathname) as Route;
    router.replace(nextHref, { scroll: false });
  }, [search, country, city, category, provider, media, favoritesOnly, view, pathname, router]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return cameras.filter((camera) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          camera.name,
          camera.city,
          camera.country,
          camera.category,
          camera.provider,
          camera.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCountry = !country || camera.country === country;
      const matchesCity = !city || camera.city === city;
      const matchesCategory = !category || camera.category === category;
      const matchesProvider = !provider || camera.provider === provider;
      const matchesMedia =
        !media ||
        (media === "image" && Boolean(camera.previewImageUrl)) ||
        (media === "stream" && Boolean(camera.streamUrl));
      const matchesFavorite = !favoritesOnly || favorites.includes(camera.id);

      return (
        matchesSearch &&
        matchesCountry &&
        matchesCity &&
        matchesCategory &&
        matchesProvider &&
        matchesMedia &&
        matchesFavorite
      );
    });
  }, [cameras, category, city, country, favorites, favoritesOnly, media, provider, search]);

  const clearFilters = () => {
    setSearch("");
    setCountry("");
    setCity("");
    setCategory("");
    setProvider("");
    setMedia("");
    setFavoritesOnly(false);
    setView("grid");
  };

  return (
    <div className="space-y-8 pb-14 pt-6">
      <section className="glass-panel overflow-hidden rounded-2xl px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
                Global live camera dashboard
              </p>
              <h1
                className="max-w-3xl text-4xl leading-tight md:text-6xl"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Browse public cameras from official sources, with mock-ready adapters
                behind the glass.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
                Search by country, city, category, source, and media availability.
                Mock mode is live now, and official provider adapters can be added
                without changing the UI surface.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Cameras indexed" value={stats.total.toString()} />
              <Metric label="Countries" value={stats.countries.toString()} />
              <Metric label="Online now" value={stats.online.toString()} />
              <Metric label="Sources" value={stats.providers.toString()} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {providers.slice(0, 4).map((providerMeta) => (
              <div
                className="rounded-lg border border-[color:var(--border)] bg-[rgba(250,249,245,0.04)] p-4"
                key={providerMeta.id}
              >
                <p className="text-sm text-[color:var(--muted)]">{providerMeta.name}</p>
                <p className="mt-2 text-sm text-[color:var(--text)]">{providerMeta.note}</p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-[color:var(--soft)]">
                  {providerMeta.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <label className="mb-2 block text-sm text-[color:var(--muted)]" htmlFor="search">
            Search cameras
          </label>
          <input
            className="w-full rounded-lg border border-[color:var(--border)] bg-[rgba(15,17,17,0.65)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--soft)]"
            id="search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by camera, city, tag, or provider"
            value={search}
          />
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm text-[color:var(--muted)]">View mode</p>
            <button
              className="text-sm text-[color:var(--muted)] underline underline-offset-4"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ToggleButton active={view === "grid"} onClick={() => setView("grid")}>
              Grid view
            </ToggleButton>
            <ToggleButton active={view === "map"} onClick={() => setView("map")}>
              Map view
            </ToggleButton>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Select
          label="Country"
          onChange={setCountry}
          options={filterOptions.countries}
          value={country}
        />
        <Select label="City" onChange={setCity} options={filterOptions.cities} value={city} />
        <Select
          label="Category"
          onChange={setCategory}
          options={filterOptions.categories}
          value={category}
        />
        <Select
          label="Provider"
          onChange={setProvider}
          options={filterOptions.providers}
          value={provider}
        />
        <Select
          label="Media"
          onChange={setMedia}
          options={["image", "stream"]}
          value={media}
        />
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="mb-2 text-sm text-[color:var(--muted)]">Favorites</p>
          <button
            className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-4 py-3 text-sm transition ${
              favoritesOnly
                ? "border-[rgba(201,100,66,0.28)] bg-[rgba(201,100,66,0.18)] text-[color:var(--text)]"
                : "border-[color:var(--border)] bg-[rgba(15,17,17,0.5)] text-[color:var(--muted)]"
            }`}
            onClick={() => setFavoritesOnly((current) => !current)}
            type="button"
          >
            {favoritesOnly ? "Showing favorites" : "Show favorites"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
                Trending cameras
              </p>
              <h2
                className="mt-2 text-3xl text-[color:var(--text)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Fresh updates and busy corridors
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {trending.map((camera) => (
              <CameraCard
                camera={camera}
                favorite={favorites.includes(camera.id)}
                key={camera.id}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
            Popular tags
          </p>
          <h2
            className="mt-2 text-3xl text-[color:var(--text)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Explore by theme
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {popularTags.map(([tag, count]) => (
              <button
                className="rounded-full border border-[color:var(--border)] bg-[rgba(250,249,245,0.04)] px-3 py-2 text-sm text-[color:var(--text)] transition hover:border-[color:var(--border-strong)]"
                key={tag}
                onClick={() => setSearch(tag)}
                type="button"
              >
                #{tag} <span className="text-[color:var(--muted)]">{count}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-[color:var(--border)] bg-[rgba(201,100,66,0.08)] p-4">
            <p className="text-sm text-[color:var(--text)]">
              Shareable filtering is built in. Every search and filter change syncs
              to the URL so curated camera views can be linked directly.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
              Camera catalog
            </p>
            <h2
              className="mt-2 text-3xl text-[color:var(--text)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {filtered.length} camera{filtered.length === 1 ? "" : "s"} match the current view
            </h2>
          </div>
          <div className="text-sm text-[color:var(--muted)]">
            {stats.withStreams} sources currently expose a mock stream surface.
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            action={
              <button
                className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm text-[color:var(--text)]"
                onClick={clearFilters}
                type="button"
              >
                Reset filters
              </button>
            }
            description="Try a broader search, switch back to grid view, or clear filters. Mock mode keeps the app usable even when live providers are not configured."
            title="No cameras matched"
          />
        ) : view === "map" ? (
          <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)]">
            <CameraMap cameras={filtered} height={560} />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((camera) => (
              <CameraCard
                camera={camera}
                favorite={favorites.includes(camera.id)}
                key={camera.id}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[rgba(250,249,245,0.04)] p-4">
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
      <p
        className="mt-2 text-3xl text-[color:var(--text)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {value}
      </p>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <label className="mb-2 block text-sm text-[color:var(--muted)]">
        {label}
        <select
          className="mt-2 min-h-11 w-full rounded-lg border border-[color:var(--border)] bg-[rgba(15,17,17,0.65)] px-3 py-2 text-[color:var(--text)]"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-11 rounded-lg border px-4 py-3 text-sm transition ${
        active
          ? "border-[rgba(201,100,66,0.28)] bg-[rgba(201,100,66,0.18)] text-[color:var(--text)]"
          : "border-[color:var(--border)] bg-[rgba(15,17,17,0.5)] text-[color:var(--muted)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
