import { tool } from "langchain";
import { z } from "zod";
import { readSheet } from "./googleSheet/readSheet";
import { writeSheet } from "./googleSheet/writeSheet";
// import { createLogin } from "./vaultwarden/createLogin";
// import { deleteItem } from "./vaultwarden/deleteItem";
// import { getLogin } from "./vaultwarden/getLogin";
// import { getPassword } from "./vaultwarden/getPassword";
// export const bitWardenLoginTool = tool(getLogin, {
//   name: "get_login_bitwarden",
//   description:
//     "Utilise cet outil quand l'utilisateur veut récupérer le login (username) d'une entrée Vaultwarden.",
//   schema: z.object({
//     name: z.string().describe("Nom exact de l'entrée Vaultwarden"),
//   }),
// });
// export const bitWardenPasswordTool = tool(getPassword, {
//   name: "get_password_bitwarden",
//   description:
//     "Utilise cet outil quand l'utilisateur veut récupérer le mot de passe d'une entrée Vaultwarden.",
//   schema: z.object({
//     name: z.string().describe("Nom exact de l'entrée Vaultwarden"),
//   }),
// });
// export const bitWardenCreateLoginTool = tool(createLogin, {
//   name: "create_login_bitwarden",
//   description:
//     "Utilise cet outil quand l'utilisateur veut stocker un compte existant (site, login, mot de passe) dans Vaultwarden.",
//   schema: z.object({
//     name: z.string().describe("Nom du site ex: Amazon, CAF, France Travail"),
//     username: z.string().describe("Login ou email du compte"),
//     password: z.string().describe("Mot de passe du compte"),
//   }),
// });
// export const bitWardenDeleteItemTool = tool(deleteItem, {
//   name: "delete_item_bitwarden",
//   description:
//     "Utilise cet outil quand l'utilisateur veut supprimer une entrée Vaultwarden.",
//   schema: z.object({
//     name: z.string().describe("Nom exact de l'entrée Vaultwarden à supprimer"),
//   }),
// });
const readSheetTool = tool(readSheet, {
    name: 'sheet_read',
    description: 'Lit une cellule du Google Sheet budget. Cellules disponibles : RSA=G2, Loyer=E11, Basic Fit=E12, Netflix=E13, Suno AI=E14, Electricité=E15, Cdiscount Mobile=E16, Total frais fixes=E17, Epargne potentielle=G18, Epargne réel=G19',
    schema: z.object({
        month: z.string().describe("Nom de l'onglet ex: 'Avril 2026'"),
        cell: z.string().describe("Coordonnée de la cellule ex: 'G2'"),
    }),
});
export const writeSheetTool = tool(writeSheet, {
    name: 'sheet_write',
    description: "Ajoute une dépense de courses dans le Google Sheet dédié, après scan d\'un ticket de caisse. Ne pas utiliser rag_add_pdf pour les tickets de caisse. Génère automatiquement la date du jour.",
    schema: z.object({
        month: z.string().describe("Onglet au format 'YYYY-MM' ex: '2026-03'"),
        date: z
            .string()
            .describe("Date d'achat extraite du ticket au format 'DD/MM/YYYY'"),
        magasin: z.string().describe("Nom du magasin ex: 'Leclerc', 'Lidl'"),
        montant: z.number().describe('Montant TTC en euros ex: 42.50'),
    }),
});
export const allTools = [
    readSheetTool,
    writeSheetTool,
    // bitWardenLoginTool,
    // bitWardenPasswordTool,
    // bitWardenCreateLoginTool,
    // bitWardenDeleteItemTool,
];
