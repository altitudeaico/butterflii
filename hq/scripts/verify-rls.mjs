// Verifies the Phase 0 and Phase 1 RLS-denial test criteria directly against
// Supabase, using the same anon key the shipped client uses. Run with:
//
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   TEST_EMAIL=... TEST_PASSWORD=... \
//   [SUPER_EMAIL=... SUPER_PASSWORD=...] \
//   [ARTIST_EMAIL=... ARTIST_PASSWORD=...] \
//   [OPS_EMAIL=... OPS_PASSWORD=...] \
//   node scripts/verify-rls.mjs
//
// TEST_EMAIL/TEST_PASSWORD (Phase 0): any non-super-admin hq.profiles row.
// SUPER_EMAIL/SUPER_PASSWORD (Phase 1): a super_admin, needed to create and
// clean up a scratch event/objective/task fixture for the artist and
// ops_admin checks below. Those checks are skipped, not failed, when the
// credentials they need aren't supplied, so this still runs usefully with
// only TEST_EMAIL/TEST_PASSWORD set.
// ARTIST_EMAIL/ARTIST_PASSWORD, OPS_EMAIL/OPS_PASSWORD (Phase 1): the
// artist/ops_admin accounts, needed for their respective checks.
// Never hardcode real credentials in this file; pass them at run time only.
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const testEmail = process.env.TEST_EMAIL
const testPassword = process.env.TEST_PASSWORD
const superEmail = process.env.SUPER_EMAIL
const superPassword = process.env.SUPER_PASSWORD
const artistEmail = process.env.ARTIST_EMAIL
const artistPassword = process.env.ARTIST_PASSWORD
const opsEmail = process.env.OPS_EMAIL
const opsPassword = process.env.OPS_PASSWORD

if (!url || !anonKey || !testEmail || !testPassword) {
  console.error(
    'Usage: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... TEST_EMAIL=... TEST_PASSWORD=... node scripts/verify-rls.mjs\n' +
      '(optionally SUPER_EMAIL/SUPER_PASSWORD, ARTIST_EMAIL/ARTIST_PASSWORD, OPS_EMAIL/OPS_PASSWORD for the Phase 1 checks)',
  )
  process.exit(1)
}

let failures = 0

function report(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`)
  if (!ok) failures += 1
}

function skip(name, reason) {
  console.log(`SKIP - ${name} (${reason})`)
}

// A real Postgres/PostgREST denial always carries a `code` (e.g. 42501 for
// permission denied, P0001 for a trigger's raised exception). Anything else,
// a proxy/network failure, a bad URL, is not a valid pass and must not be
// conflated with an actual RLS/permission denial.
function isPostgrestDenial(error) {
  return !!error?.code
}

function freshClient() {
  return createClient(url, anonKey, { db: { schema: 'hq' } })
}

// --- Phase 0: profile role-escalation checks ---

const authedClient = freshClient()
const { data: signInData, error: signInError } = await authedClient.auth.signInWithPassword({
  email: testEmail,
  password: testPassword,
})

if (signInError || !signInData.session) {
  report('sign in as test user', false, signInError?.message ?? 'no session returned')
} else {
  report('sign in as test user', true)
  const myId = signInData.session.user.id

  const { error: insertError } = await authedClient
    .from('profiles')
    .insert({ id: crypto.randomUUID(), display_name: 'Intruder', role: 'super_admin' })
  report(
    'insert a new super_admin row is denied',
    isPostgrestDenial(insertError),
    insertError ? insertError.message : 'insert unexpectedly succeeded',
  )

  const { error: updateError } = await authedClient
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', myId)
  report(
    'escalating own role to super_admin is denied',
    isPostgrestDenial(updateError),
    updateError ? updateError.message : 'update unexpectedly succeeded',
  )

  await authedClient.auth.signOut()
}

// --- anon read denials (no credentials needed) ---

const anonClient = freshClient()
const { data: anonProfileRows, error: anonProfileError } = await anonClient.from('profiles').select('*')
report(
  'anonymous select on profiles is denied',
  isPostgrestDenial(anonProfileError) || (!anonProfileError && (anonProfileRows?.length ?? 0) === 0),
  anonProfileError ? anonProfileError.message : `returned ${anonProfileRows?.length ?? 0} rows`,
)

const { data: anonTaskRows, error: anonTaskError } = await anonClient.from('tasks').select('*')
report(
  'anonymous select on tasks is denied',
  isPostgrestDenial(anonTaskError) || (!anonTaskError && (anonTaskRows?.length ?? 0) === 0),
  anonTaskError ? anonTaskError.message : `returned ${anonTaskRows?.length ?? 0} rows`,
)

// --- Phase 1: events/objectives/tasks checks (need a scratch fixture) ---

if (!superEmail || !superPassword) {
  skip('artist and ops_admin task/event checks', 'SUPER_EMAIL/SUPER_PASSWORD not provided')
} else {
  const superClient = freshClient()
  const { data: superSignIn, error: superSignInError } = await superClient.auth.signInWithPassword({
    email: superEmail,
    password: superPassword,
  })

  if (superSignInError || !superSignIn.session) {
    report('sign in as super admin', false, superSignInError?.message ?? 'no session returned')
  } else {
    report('sign in as super admin', true)
    let event = null

    const { data: createdEvent, error: eventError } = await superClient
      .from('events')
      .insert({ name: 'RLS verification fixture', event_date: '2099-01-01' })
      .select()
      .single()
    event = createdEvent

    if (eventError || !event) {
      report('create scratch event fixture', false, eventError?.message)
    } else {
      const { data: objective, error: objectiveError } = await superClient
        .from('objectives')
        .insert({ event_id: event.id, title: 'RLS test objective' })
        .select()
        .single()

      if (objectiveError || !objective) {
        report('create scratch objective fixture', false, objectiveError?.message)
      } else {
        // Artist checks: insert restrictions, column-scoped update restriction,
        // no delete, and a positive control that the legitimate path still works.
        if (!artistEmail || !artistPassword) {
          skip('artist task denial checks', 'ARTIST_EMAIL/ARTIST_PASSWORD not provided')
        } else {
          const artistClient = freshClient()
          const { data: artistSignIn, error: artistSignInError } =
            await artistClient.auth.signInWithPassword({ email: artistEmail, password: artistPassword })

          if (artistSignInError || !artistSignIn.session) {
            report('sign in as artist', false, artistSignInError?.message ?? 'no session returned')
          } else {
            report('sign in as artist', true)
            const artistId = artistSignIn.session.user.id

            const { data: ownTask } = await superClient
              .from('tasks')
              .insert({
                objective_id: objective.id,
                title: 'RLS test task (artist owned)',
                owner_id: artistId,
              })
              .select()
              .single()

            const { error: badInsertError } = await artistClient.from('tasks').insert({
              objective_id: objective.id,
              title: 'sneaky adult-origin task',
              origin: 'adult',
            })
            report(
              "artist inserting a non-'artist_idea' task is denied",
              isPostgrestDenial(badInsertError),
              badInsertError ? badInsertError.message : 'insert unexpectedly succeeded',
            )

            if (ownTask) {
              const { error: badUpdateError } = await artistClient
                .from('tasks')
                .update({ title: 'changed by artist' })
                .eq('id', ownTask.id)
              report(
                'artist changing a field other than status on her own task is denied',
                isPostgrestDenial(badUpdateError),
                badUpdateError ? badUpdateError.message : 'update unexpectedly succeeded',
              )

              const { error: goodUpdateError } = await artistClient
                .from('tasks')
                .update({ status: 'doing' })
                .eq('id', ownTask.id)
              report('artist updating her own task status succeeds', !goodUpdateError, goodUpdateError?.message)

              const { data: deletedByArtist, error: artistDeleteError } = await artistClient
                .from('tasks')
                .delete()
                .eq('id', ownTask.id)
                .select()
              report(
                'artist deleting her own task is denied',
                isPostgrestDenial(artistDeleteError) ||
                  (!artistDeleteError && (deletedByArtist?.length ?? 0) === 0),
                artistDeleteError ? artistDeleteError.message : `deleted ${deletedByArtist?.length ?? 0} row(s)`,
              )
            }

            await artistClient.auth.signOut()
          }
        }

        // Ops admin checks: no delete, but operational update still works.
        if (!opsEmail || !opsPassword) {
          skip('ops_admin event checks', 'OPS_EMAIL/OPS_PASSWORD not provided')
        } else {
          const opsClient = freshClient()
          const { data: opsSignIn, error: opsSignInError } = await opsClient.auth.signInWithPassword({
            email: opsEmail,
            password: opsPassword,
          })

          if (opsSignInError || !opsSignIn.session) {
            report('sign in as ops admin', false, opsSignInError?.message ?? 'no session returned')
          } else {
            report('sign in as ops admin', true)

            const { data: deletedRows, error: deleteError } = await opsClient
              .from('events')
              .delete()
              .eq('id', event.id)
              .select()
            report(
              'ops_admin deleting an event is denied',
              isPostgrestDenial(deleteError) || (!deleteError && (deletedRows?.length ?? 0) === 0),
              deleteError ? deleteError.message : `deleted ${deletedRows?.length ?? 0} row(s)`,
            )

            const { error: opsUpdateError } = await opsClient
              .from('events')
              .update({ location: 'updated by ops' })
              .eq('id', event.id)
            report('ops_admin updating an event field succeeds', !opsUpdateError, opsUpdateError?.message)

            await opsClient.auth.signOut()
          }
        }
      }
    }

    // Cleanup regardless of what happened above: cascades to the objective
    // and any leftover tasks.
    if (event) {
      await superClient.from('events').delete().eq('id', event.id)
    }
    await superClient.auth.signOut()
  }
}

console.log(failures === 0 ? '\nAll RLS checks passed.' : `\n${failures} RLS check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
