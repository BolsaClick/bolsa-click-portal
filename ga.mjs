import { GoogleAuth } from 'google-auth-library'
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    private_key: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
})
const client = await auth.getClient()
const r = await client.request({ url: 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries' })
  .catch(e => ({ error: e.response?.data?.error?.message || e.message }))
if (r.error) { console.log('  ERRO:', String(r.error).slice(0,160)) }
else {
  const a = r.data.accountSummaries || []
  console.log(`  contas visíveis: ${a.length}`)
  for (const c of a) for (const p of (c.propertySummaries||[])) console.log(`    ${p.property}  ${p.displayName}`)
}
