import { normalizeDateRangeSearch, toOddsApiDateRange } from '#/lib/dateRange'
import { getOddsBySport } from '#/lib/oddsApi'
import type { OddsEvent } from '#/lib/types'
import { Link, createFileRoute } from '@tanstack/react-router'

type TeamSearch = {
  from: string
  to: string
  sportKey: string
}

export const Route = createFileRoute('/sports/team/$teamName')({
  validateSearch: (search: Record<string, unknown>) => {
    const range = normalizeDateRangeSearch(search)
    const sportKey =
      typeof search.sportKey === 'string' ? search.sportKey.trim() : ''

    if (!sportKey) {
      throw new Error('A sport key is required to load team odds.')
    }

    return {
      ...range,
      sportKey,
    } satisfies TeamSearch
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const odds = (await getOddsBySport({
      data: {
        sport: deps.sportKey,
        ...toOddsApiDateRange(deps),
      },
    })) as OddsEvent[]

    const games = odds.filter(
      (game) =>
        game.home_team === params.teamName ||
        game.away_team === params.teamName,
    )

    return {
      sportKey: deps.sportKey,
      teamName: params.teamName,
      from: deps.from,
      to: deps.to,
      games,
    }
  },
  component: TeamOddsPage,
})

function TeamOddsPage() {
  const { sportKey, teamName, from, to, games } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">{sportKey}</p>
        <h1 className="display-title mb-3 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
          {teamName}
        </h1>
        <p className="m-0 mb-6 text-(--sea-ink-soft)">
          Games in range {from} to {to}
        </p>
        <p className="m-0 mb-6">
          <Link
            to="/sports/$sportKey"
            params={{ sportKey }}
            search={{ from, to }}
            className="text-(--sea-ink) underline"
          >
            Back to sport odds
          </Link>
        </p>
        {games.length === 0 ? (
          <p className="m-0 text-(--sea-ink-soft)">
            No games found for this team in the selected date range.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-4 p-0">
            {games.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-(--line-soft) p-4"
              >
                <p className="m-0 mb-2 text-sm text-(--sea-ink-soft)">
                  {new Date(event.commence_time).toLocaleString()}
                </p>
                <p className="m-0 text-(--sea-ink)">
                  {event.away_team ?? 'TBD'} @ {event.home_team ?? 'TBD'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
