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
  commenceTimeFrom?: string
  commenceTimeTo?: string
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

    const commenceTimeFromValue = (input as GetOddsBySportInput).commenceTimeFrom
    const commenceTimeToValue = (input as GetOddsBySportInput).commenceTimeTo

    const commenceTimeFrom =
      typeof commenceTimeFromValue === 'string'
        ? commenceTimeFromValue.trim()
        : undefined
    const commenceTimeTo =
      typeof commenceTimeToValue === 'string'
        ? commenceTimeToValue.trim()
        : undefined

    return { sport, commenceTimeFrom, commenceTimeTo }
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.ODDS_API_KEY

    if (!apiKey) {
      throw new Error('ODDS_API_KEY is not configured.')
    }

    const fetchOdds = async (markets: string) => {
      const url = new URL(`${BASE_URL}/sports/${data.sport}/odds`)
      url.searchParams.set('apiKey', apiKey)
      url.searchParams.set('regions', 'us')
      url.searchParams.set('markets', markets)
      url.searchParams.set('oddsFormat', 'american')
      url.searchParams.set('dateFormat', 'iso')

      if (data.commenceTimeFrom) {
        url.searchParams.set('commenceTimeFrom', data.commenceTimeFrom)
      }

      if (data.commenceTimeTo) {
        url.searchParams.set('commenceTimeTo', data.commenceTimeTo)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
      })

      const responseText = await response.text()
      let parsedBody: unknown = responseText

      try {
        parsedBody = JSON.parse(responseText)
      } catch {
        // Keep plain text body when response is not JSON.
      }

      return { response, parsedBody, responseText }
    }

    const initial = await fetchOdds('h2h,spreads,totals')

    if (initial.response.ok) {
      if (
        typeof initial.parsedBody === 'object' &&
        initial.parsedBody !== null
      ) {
        return initial.parsedBody
      }

      throw new Error(
        `Unexpected odds response for "${data.sport}": ${initial.responseText}`,
      )
    }

    const isInvalidMarketCombo =
      initial.response.status === 422 &&
      typeof initial.parsedBody === 'object' &&
      initial.parsedBody !== null &&
      'error_code' in initial.parsedBody &&
      (initial.parsedBody as { error_code?: string }).error_code ===
        'INVALID_MARKET_COMBO'

    if (isInvalidMarketCombo) {
      const fallback = await fetchOdds('outrights')

      if (fallback.response.ok) {
        if (
          typeof fallback.parsedBody === 'object' &&
          fallback.parsedBody !== null
        ) {
          return fallback.parsedBody
        }

        throw new Error(
          `Unexpected odds response for "${data.sport}": ${fallback.responseText}`,
        )
      }
    }

    throw new Error(
      `Failed to fetch odds for "${data.sport}" (${initial.response.status}): ${initial.responseText}`,
    )
  })
