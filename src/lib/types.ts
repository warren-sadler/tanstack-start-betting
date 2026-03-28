export type OddsMarketKey = 'h2h' | 'spreads' | 'totals' | 'outrights'

export type OddsOutcome = {
  name: string
  price: number
  point?: number
  description?: string
}

export type OddsMarket = {
  key: OddsMarketKey | string
  outcomes: OddsOutcome[]
}

export type OddsBookmaker = {
  key: string
  title: string
  markets: OddsMarket[]
}

export type OddsEvent = {
  id: string
  commence_time: string
  home_team?: string
  away_team?: string
  bookmakers?: OddsBookmaker[]
}
