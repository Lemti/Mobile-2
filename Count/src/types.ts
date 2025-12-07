export type Screening = {
  id: string
  movieTitle: string
  cinemaName: string
  startsAt: string
  createdBy: string
  createdAt: any
  tmdbId?: number | null
  posterPath?: string | null
}

export type Count = {
  id: string
  screeningId: string
  userId: string
  value: number
  createdAt: string
}

export type Review = {
  id: string
  screeningId: string
  userId: string
  text: string
  rating?: number | null
  createdAt: any
}
