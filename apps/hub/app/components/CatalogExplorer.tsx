"use client";

import { useMemo, useState } from "react";
import type {
  AccessibilityFeature,
  CatalogFilters,
  CatalogGame,
  EnergyLevel,
  MovementTag,
} from "../catalog/catalog";
import {
  accessibilityFeatures,
  defaultCatalogFilters,
  energyLevels,
  filterCatalogGames,
  movementTags,
} from "../catalog/catalog";

function formatTag(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function uniqueLocales(games: readonly CatalogGame[]): string[] {
  return [...new Set(games.flatMap((game) => game.locales))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function GameCard({ game }: { game: CatalogGame }) {
  return (
    <article className="game-card">
      <div className="game-card-art" aria-hidden="true">
        <span>{game.title.slice(0, 1).toUpperCase()}</span>
      </div>
      <div className="game-card-body">
        <div className="game-card-kicker">
          <span>{game.energy}</span>
          <span>
            Ages {game.ageRange.min}–{game.ageRange.max}
          </span>
        </div>
        <h3>{game.title}</h3>
        <p className="game-creator">By {game.creator}</p>
        <p>{game.summary}</p>
        <ul className="tag-list" aria-label="Movement tags">
          {game.movementTags.map((tag) => (
            <li key={tag}>{formatTag(tag)}</li>
          ))}
        </ul>
        <div className="game-card-actions">
          <a className="button button-ink" href={game.gameUrl} target="_blank" rel="noreferrer">
            Play on creator Site <span aria-hidden="true">↗</span>
          </a>
          <a className="text-link" href={game.sourceUrl} target="_blank" rel="noreferrer">
            Source <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function CatalogExplorer({ games }: { games: CatalogGame[] }) {
  const [filters, setFilters] = useState<CatalogFilters>(defaultCatalogFilters);
  const locales = useMemo(() => uniqueLocales(games), [games]);
  const filteredGames = useMemo(() => filterCatalogGames(games, filters), [games, filters]);
  const hasFilters = Object.entries(filters).some(
    ([key, value]) => (key === "query" ? value !== "" : value !== "all"),
  );

  function updateFilter<Key extends keyof CatalogFilters>(
    key: Key,
    value: CatalogFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="catalog-explorer">
      <div className="catalog-toolbar">
        <label className="search-field">
          <span className="sr-only">Search community games</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="Search games, creators, or movement"
          />
        </label>

        <div className="catalog-filters" aria-label="Filter community games">
          <label>
            <span className="sr-only">Movement</span>
            <select
              value={filters.movement}
              onChange={(event) =>
                updateFilter("movement", event.target.value as MovementTag | "all")
              }
            >
              <option value="all">All movement</option>
              {movementTags.map((tag) => (
                <option key={tag} value={tag}>
                  {formatTag(tag)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Energy level</span>
            <select
              value={filters.energy}
              onChange={(event) =>
                updateFilter("energy", event.target.value as EnergyLevel | "all")
              }
            >
              <option value="all">All energy</option>
              {energyLevels.map((level) => (
                <option key={level} value={level}>
                  {formatTag(level)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Language</span>
            <select
              value={filters.locale}
              onChange={(event) => updateFilter("locale", event.target.value)}
            >
              <option value="all">All languages</option>
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Accessibility feature</span>
            <select
              value={filters.accessibility}
              onChange={(event) =>
                updateFilter(
                  "accessibility",
                  event.target.value as AccessibilityFeature | "all",
                )
              }
            >
              <option value="all">All access needs</option>
              {accessibilityFeatures.map((feature) => (
                <option key={feature} value={feature}>
                  {formatTag(feature)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="catalog-summary" aria-live="polite">
        <span>
          {filteredGames.length} {filteredGames.length === 1 ? "game" : "games"}
        </span>
        {hasFilters ? (
          <button type="button" onClick={() => setFilters(defaultCatalogFilters)}>
            Clear filters
          </button>
        ) : null}
      </div>

      {filteredGames.length > 0 ? (
        <div className="game-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="empty-catalog">
          <div className="empty-stage" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">The stage is open</p>
          <h3>Be one of the first Manse creators.</h3>
          <p>
            Community games will appear here after their public manifest passes automated checks
            and a maintainer review.
          </p>
          <div className="button-row centered-buttons">
            <a className="button button-coral" href="/docs#install">
              Install Manse Creator <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-ghost" href="/submit">
              How listing works
            </a>
          </div>
        </div>
      ) : (
        <div className="empty-catalog compact-empty">
          <p className="eyebrow">No matches</p>
          <h3>Try a broader movement or search.</h3>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setFilters(defaultCatalogFilters)}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
