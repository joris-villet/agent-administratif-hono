import { tool } from "langchain";
import { z } from "zod";
import { createLogin } from "./vaultwarden/createLogin";
import { deleteItem } from "./vaultwarden/deleteItem";
import { getLogin } from "./vaultwarden/getLogin";
import { getPassword } from "./vaultwarden/getPassword";

export const bitWardenLoginTool = tool(getLogin, {
  name: "get_login_bitwarden",
  description:
    "Utilise cet outil quand l'utilisateur veut récupérer le login (username) d'une entrée Vaultwarden.",
  schema: z.object({
    name: z.string().describe("Nom exact de l'entrée Vaultwarden"),
  }),
});

export const bitWardenPasswordTool = tool(getPassword, {
  name: "get_password_bitwarden",
  description:
    "Utilise cet outil quand l'utilisateur veut récupérer le mot de passe d'une entrée Vaultwarden.",
  schema: z.object({
    name: z.string().describe("Nom exact de l'entrée Vaultwarden"),
  }),
});

export const bitWardenCreateLoginTool = tool(createLogin, {
  name: "create_login_bitwarden",
  description:
    "Utilise cet outil quand l'utilisateur veut stocker un compte existant (site, login, mot de passe) dans Vaultwarden.",
  schema: z.object({
    name: z.string().describe("Nom du site ex: Amazon, CAF, France Travail"),
    username: z.string().describe("Login ou email du compte"),
    password: z.string().describe("Mot de passe du compte"),
  }),
});

export const bitWardenDeleteItemTool = tool(deleteItem, {
  name: "delete_item_bitwarden",
  description:
    "Utilise cet outil quand l'utilisateur veut supprimer une entrée Vaultwarden.",
  schema: z.object({
    name: z.string().describe("Nom exact de l'entrée Vaultwarden à supprimer"),
  }),
});

export const allTools = [
  bitWardenLoginTool,
  bitWardenPasswordTool,
  bitWardenCreateLoginTool,
  bitWardenDeleteItemTool,
];
