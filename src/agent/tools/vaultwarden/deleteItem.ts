import { deleteItemById, findItemByName, getItemId } from './client'

type DeleteItemInput = {
  name: string
}

export const deleteItem = async ({ name }: DeleteItemInput) => {
  try {
    const item = await findItemByName(name)
    if (!item) {
      return `❌ Entrée introuvable: ${name}`
    }

    const itemId = getItemId(item)
    if (!itemId) {
      return `❌ Impossible de supprimer: identifiant introuvable pour ${name}`
    }

    await deleteItemById(itemId)
    return `🗑️ Entrée supprimée : ${name}`
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return `❌ Impossible de supprimer l'entrée: ${message}`
  }
}
