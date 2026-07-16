// export const refreshAccessToken = async () => {
//   const response = await fetch('https://oauth2.googleapis.com/token', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: new URLSearchParams({
//       client_id: process.env.GOOGLE_CLIENT_ID!,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//       refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
//       grant_type: 'refresh_token',
//     }),
//   })

//   const data = await response.json()
//   console.log('🔑 refresh token response =>', JSON.stringify(data))
//   return data.access_token
// }


let cachedToken: string | null = null;
let tokenExpiry = 0;

export const refreshAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  
  if (data.error) {
    console.error('Google refresh error:', data);
    throw new Error(data.error_description);
  }
  
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // -60s marge
  console.log('🔑 token rafraîchi');
  return cachedToken;
};