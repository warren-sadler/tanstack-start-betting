import { listSports } from '#/lib/oddsApi'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    const sports = await listSports()
    return { sports }
  },
})

type SportSummary = {
  key: string
  title: string
}

function Index() {
  const { sports } = Route.useLoaderData()
  const sportsList = sports as SportSummary[]

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Sports</p>
        <h1 className="display-title mb-6 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Browse odds by sport
        </h1>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {sportsList.map((sport) => (
            <li key={sport.key}>
              <a
                href={`/sports/${sport.key}`}
                className="block rounded-xl border border-(--line-soft) px-4 py-3 text-(--sea-ink) no-underline transition-colors hover:bg-(--surface-soft)"
              >
                {sport.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
