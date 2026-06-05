import { createLoginItem, findItemByName, getItemName } from './client'

type CreateLoginInput = {
  name: string
  username: string
  password: string
}

export const createLogin = async ({ name, username, password }: CreateLoginInput) => {
  try {
    const existing = await findItemByName(name)
    if (existing) {
      return `⚠️ Une entrée existe déjà: ${name}`
    }

    const created = await createLoginItem(name, username, password)
    const itemName = getItemName(created) || name

    return `✅ Entrée créée : ${itemName}\n👤 Login : ${username}\n🔐 Mot de passe : enregistré`
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return `❌ Impossible de créer l'entrée: ${message}`
  }
}
