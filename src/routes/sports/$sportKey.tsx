import { normalizeDateRangeSearch, toOddsApiDateRange } from '#/lib/dateRange'
import { getOddsBySport } from '#/lib/oddsApi'
import type { OddsEvent, OddsMarket, OddsOutcome } from '#/lib/types'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sports/$sportKey')({
  validateSearch: (search: Record<string, unknown>) =>
    normalizeDateRangeSearch(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const odds = await getOddsBySport({
      data: {
        sport: params.sportKey,
        ...toOddsApiDateRange(deps),
      },
    })

    return {
      sportKey: params.sportKey,
      from: deps.from,
      to: deps.to,
      odds: odds as OddsEvent[],
    }
  },
  component: SportOddsPage,
})

function SportOddsPage() {
  const { sportKey, from, to, odds } = Route.useLoaderData()

  const getMarket = (
    event: OddsEvent,
    key: 'h2h' | 'spreads' | 'totals',
  ): OddsMarket | undefined => {
    const bookmaker = event.bookmakers?.[0]
    return bookmaker?.markets.find((market) => market.key === key)
  }

  const getOutcome = (
    market: OddsMarket | undefined,
    name: string,
  ): OddsOutcome | undefined => market?.outcomes.find((outcome) => outcome.name === name)

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') {
      return 'N/A'
    }

    return price > 0 ? `+${price}` : `${price}`
  }

  const formatPoint = (point: number | undefined) => {
    if (typeof point !== 'number') {
      return null
    }

    return point > 0 ? `+${point}` : `${point}`
  }

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell mb-6 rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">{sportKey}</p>
        <h1 className="display-title mb-4 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
          Odds for selected date range
        </h1>
        <form className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm text-(--sea-ink-soft)">
            From
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="rounded-md border border-(--line-soft) bg-white px-3 py-2 text-(--sea-ink)"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-(--sea-ink-soft)">
            To
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="rounded-md border border-(--line-soft) bg-white px-3 py-2 text-(--sea-ink)"
            />
          </label>
          <button
            type="submit"
            className="rounded-md border border-(--line-soft) px-4 py-2 text-(--sea-ink)"
          >
            Apply range
          </button>
        </form>
      </section>

      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <h2 className="mb-4 text-2xl font-semibold text-(--sea-ink)">
          Games ({odds.length})
        </h2>
        {odds.length === 0 ? (
          <p className="m-0 text-(--sea-ink-soft)">
            No games available in this range.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-4 p-0">
            {odds.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-(--line-soft) p-4"
              >
                <p className="m-0 mb-2 text-sm text-(--sea-ink-soft)">
                  {new Date(event.commence_time).toLocaleString()}
                </p>
                {event.home_team && event.away_team ? (
                  <p className="m-0 mb-2 text-(--sea-ink)">
                    <Link
                    to="/sports/team/$teamName"
                    params={{ teamName: event.away_team }}
                    search={{ from, to, sportKey }}
                      className="text-(--sea-ink) underline"
                    >
                      {event.away_team}
                    </Link>{' '}
                    @{' '}
                    <Link
                    to="/sports/team/$teamName"
                    params={{ teamName: event.home_team }}
                    search={{ from, to, sportKey }}
                      className="text-(--sea-ink) underline"
                    >
                      {event.home_team}
                    </Link>
                  </p>
                ) : (
                  <p className="m-0 mb-2 text-(--sea-ink)">Outrights market</p>
                )}
                {event.home_team && event.away_team ? (
                  <div className="space-y-1 text-sm text-(--sea-ink-soft)">
                    {(() => {
                      const h2hMarket = getMarket(event, 'h2h')
                      const spreadMarket = getMarket(event, 'spreads')
                      const totalsMarket = getMarket(event, 'totals')

                      const awayMoneyline = formatPrice(
                        getOutcome(h2hMarket, event.away_team)?.price,
                      )
                      const homeMoneyline = formatPrice(
                        getOutcome(h2hMarket, event.home_team)?.price,
                      )

                      const awaySpreadOutcome = getOutcome(
                        spreadMarket,
                        event.away_team,
                      )
                      const homeSpreadOutcome = getOutcome(
                        spreadMarket,
                        event.home_team,
                      )
                      const overOutcome = getOutcome(totalsMarket, 'Over')
                      const underOutcome = getOutcome(totalsMarket, 'Under')

                      return (
                        <>
                          <p className="m-0">
                            Moneyline: {event.away_team} {awayMoneyline} |{' '}
                            {event.home_team} {homeMoneyline}
                          </p>
                          <p className="m-0">
                            Spread:{' '}
                            {formatPoint(awaySpreadOutcome?.point) ?? 'N/A'} (
                            {formatPrice(awaySpreadOutcome?.price)}) |{' '}
                            {formatPoint(homeSpreadOutcome?.point) ?? 'N/A'} (
                            {formatPrice(homeSpreadOutcome?.price)})
                          </p>
                          <p className="m-0">
                            Total: O/U {overOutcome?.point ?? underOutcome?.point ?? 'N/A'} (
                            {formatPrice(overOutcome?.price)}/
                            {formatPrice(underOutcome?.price)})
                          </p>
                        </>
                      )
                    })()}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
