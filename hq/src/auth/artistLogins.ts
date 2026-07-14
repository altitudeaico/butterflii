// Maps an avatar tile on the login screen to the artist's Supabase Auth
// identity, so she signs in by tapping her avatar and entering her PIN,
// never seeing or typing an email. Her account is created and its PIN set by
// the super admin (see hq/scripts/seed-profiles.sql and the project README);
// she never manages credentials herself (FR-3).
//
// A plain list, not a database table: this mapping isn't sensitive (knowing
// the email grants nothing without the PIN), and keeping it out of the
// database avoids adding an unauthenticated read surface. Extend this array
// if a second artist account is ever needed.
export type ArtistLogin = {
  slug: string
  displayName: string
  avatar: string
  authEmail: string
}

export const artistLogins: ArtistLogin[] = [
  {
    slug: 'elsie',
    displayName: 'Elsie',
    avatar: '🎨',
    authEmail: 'elsieolatoye@gmail.com',
  },
]
