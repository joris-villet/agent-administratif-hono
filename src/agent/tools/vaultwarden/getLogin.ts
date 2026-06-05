import { findItemByName, getItemUsername } from './client'

type GetLoginInput = {
  name: string
}

export const getLogin = async ({ name }: GetLoginInput) => {
  try {
    const item = await findItemByName(name)
    if (!item) {
      return `❌ Site/entrée introuvable: ${name}`
    }

    const username = getItemUsername(item)
    if (!username) {
      return `⚠️ Aucun identifiant (username/email) trouvé pour: ${name}`
    }

    return `🔑 Identifiant : ${username}`
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return `❌ Impossible de récupérer l'identifiant: ${message}`
  }
}
