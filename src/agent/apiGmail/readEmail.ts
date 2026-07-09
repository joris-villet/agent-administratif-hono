import { refreshAccessToken } from './refreshToken'

export const readEmail = async ({
  q,
  maxResults = 5,
}: {
  q: string
  maxResults?: number
}) => {
  console.log('🔍 query reçue =>', q)
  console.log('🔍 maxResults =>', maxResults)
  const accessToken = await refreshAccessToken()

  // 1. Chercher les ids
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=${maxResults}`
  console.log('🌐 url =>', url)

  const searchRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await searchRes.json()

  console.log('📬 résultat search =>', JSON.stringify(data))

  if (!data.messages?.length) return 'Aucun email trouvé'

  // 2. Lire chaque email
  const emails = await Promise.all(
    data.messages.map(async ({ id }: { id: string }) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      return res.json()
    })
  )

  return JSON.stringify(emails)
}
