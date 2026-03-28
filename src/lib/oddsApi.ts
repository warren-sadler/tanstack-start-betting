import { createServerFn } from '@tanstack/react-start'

const BASE_URL = 'https://api.the-odds-api.com/v4'

export const listSports = createServerFn().handler(async () => {
  const response = await fetch(
    `${BASE_URL}/sports?apiKey=${process.env.ODDS_API_KEY}`,
    {
      method: 'GET',
    },
  )
  const data = await response.json()
  return data
})

type GetOddsBySportInput = {
  sport: string
}

export const getOddsBySport = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== 'object') {
      throw new Error('A sport key is required to fetch odds.')
    }

    const sportValue = (input as GetOddsBySportInput).sport
    const sport = typeof sportValue === 'string' ? sportValue.trim() : ''

    if (!sport) {
      throw new Error('A sport key is required to fetch odds.')
    }

    return { sport }
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.ODDS_API_KEY

    if (!apiKey) {
      throw new Error('ODDS_API_KEY is not configured.')
    }

    const url = new URL(`${BASE_URL}/sports/${data.sport}/odds`)
    url.searchParams.set('apiKey', apiKey)
    url.searchParams.set('regions', 'us')
    url.searchParams.set('markets', 'h2h')

    const response = await fetch(url.toString(), {
      method: 'GET',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to fetch odds for "${data.sport}" (${response.status}): ${errorText}`,
      )
    }

    return response.json()
  })
