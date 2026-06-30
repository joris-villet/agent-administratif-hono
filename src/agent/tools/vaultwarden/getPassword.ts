import { findItemByName, getItemPassword } from './client'

type GetPasswordInput = {
  name: string
}

export const getPassword = async ({ name }: GetPasswordInput) => {
  try {
    const item = await findItemByName(name)
    if (!item) {
      return `❌ Site/entrée introuvable: ${name}`
    }

    const password = getItemPassword(item)
    if (!password) {
      return `⚠️ Aucun mot de passe trouvé pour ce site/cette entrée: ${name}`
    }

    return `🔐 Mot de passe : ${password}`
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return `❌ Impossible de récupérer le mot de passe pour ${name}: ${message}`
  }
}
