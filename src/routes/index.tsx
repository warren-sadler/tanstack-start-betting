import { getOddsBySport, listSports } from '#/lib/oddsApi'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    const sports = await listSports()
    const selectedSport = sports?.[0]?.key ?? null
    const odds = selectedSport
      ? await getOddsBySport({ data: { sport: selectedSport } })
      : []

    return { sports, selectedSport, odds }
  },
})

function Index() {
  const { sports, selectedSport, odds } = Route.useLoaderData()
  return (
    <div>
      <h1>Index Page</h1>
      <h2>Sports</h2>
      <pre>{JSON.stringify(sports, null, 2)}</pre>
      <h2>Odds ({selectedSport ?? 'none'})</h2>
      <pre>{JSON.stringify(odds, null, 2)}</pre>
    </div>
  )
}
