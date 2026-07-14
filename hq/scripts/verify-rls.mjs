// Verifies the Phase 0 RLS-denial test criterion directly against Supabase,
// using the same anon key the shipped client uses. Run with:
//
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   TEST_EMAIL=... TEST_PASSWORD=... node scripts/verify-rls.mjs
//
// TEST_EMAIL/TEST_PASSWORD must belong to a non-super-admin hq.profiles row
// (ops_admin or artist). Never hardcode real credentials in this file; pass
// them at run time only.
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const testEmail = process.env.TEST_EMAIL
const testPassword = process.env.TEST_PASSWORD

if (!url || !anonKey || !testEmail || !testPassword) {
  console.error(
    'Usage: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... TEST_EMAIL=... TEST_PASSWORD=... node scripts/verify-rls.mjs',
  )
  process.exit(1)
}

let failures = 0

function report(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`)
  if (!ok) failures += 1
}

// Test 1 & 2: signed in as a non-super-admin, attempt privilege escalation.
const authedClient = createClient(url, anonKey, { db: { schema: 'hq' } })
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
    !!insertError,
    insertError ? insertError.message : 'insert unexpectedly succeeded',
  )

  const { error: updateError } = await authedClient
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', myId)
  report(
    'escalating own role to super_admin is denied',
    !!updateError,
    updateError ? updateError.message : 'update unexpectedly succeeded',
  )

  await authedClient.auth.signOut()
}

// Test 3: no session at all, confirm anonymous reads are blocked.
const anonClient = createClient(url, anonKey, { db: { schema: 'hq' } })
const { data: anonRows, error: anonError } = await anonClient.from('profiles').select('*')
report(
  'anonymous select on profiles is denied',
  !!anonError || (anonRows?.length ?? 0) === 0,
  anonError ? anonError.message : `returned ${anonRows?.length ?? 0} rows`,
)

console.log(failures === 0 ? '\nAll RLS checks passed.' : `\n${failures} RLS check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
