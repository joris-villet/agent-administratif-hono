import { refreshAccessToken } from '../../apiGmail/refreshToken'

const SHEET_ID = '1njm9WHRTmzE-NaYRsvNeljTc-ES64BRn3ZTDbvXG0Gs'

export const writeSheet = async ({
  month,
  date,
  magasin,
  montant,
}: {
  month: string
  date: string
  magasin: string
  montant: number
}) => {
  const accessToken = await refreshAccessToken()

  // Première ligne vide sur la colonne A
  const rangeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(`${month}!A:A`)}`
  const rangeRes = await fetch(rangeUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const rangeData = await rangeRes.json()
  const nextRow = (rangeData.values?.length ?? 0) + 1

  // const date = new Date().toLocaleDateString('fr-FR')
  const range = `${month}!A${nextRow}:C${nextRow}`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [[date, magasin, montant]],
    }),
  })

  const data = await res.json()

  if (data.updatedCells) {
    return `Ajouté : ${date} | ${magasin} | ${montant}€ → onglet ${month}`
  }

  return `Erreur lors de l'écriture : ${JSON.stringify(data)}`
}
