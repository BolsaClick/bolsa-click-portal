import { GoogleAuth } from 'google-auth-library'
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    private_key: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
})
const c = await auth.getClient()
for (const api of ['analyticsadmin.googleapis.com','analyticsdata.googleapis.com']) {
  const r = await c.request({
    url: `https://serviceusage.googleapis.com/v1/projects/504850355633/services/${api}:enable`,
    method: 'POST',
  }).then(() => 'HABILITADA').catch(e => 'falhou: ' + String(e.response?.data?.error?.message || e.message).slice(0,90))
  console.log(`  ${api}: ${r}`)
}
