import { webcrypto } from 'node:crypto';
import { getVaultwardenAccessToken } from './auth';
const normalizeUrl = (value) => value.replace(/\/+$/, '');
const resolveVaultwardenUrl = (value) => {
    const normalized = normalizeUrl(value);
    if (process.env.DOCKER_ENV === 'true') {
        return normalized.replace('http://localhost:8000', 'http://vaultwarden:80');
    }
    return normalized;
};
const getVaultwardenUrl = () => {
    const url = process.env.VAULTWARDEN_URL?.trim();
    if (!url) {
        throw new Error("Variable d'environnement manquante: VAULTWARDEN_URL");
    }
    return resolveVaultwardenUrl(url);
};
const getItemId = (item) => item.id ?? item.Id ?? '';
const getItemName = (item) => item.name ?? item.Name ?? '';
const getItemLogin = (item) => item.login ?? item.Login;
export const getItemUsername = (item) => {
    const login = getItemLogin(item);
    return login?.username ?? login?.Username ?? '';
};
export const getItemPassword = (item) => {
    const login = getItemLogin(item);
    return login?.password ?? login?.Password ?? '';
};
const requestVaultwarden = async (path, init = {}) => {
    const token = await getVaultwardenAccessToken();
    const response = await fetch(`${getVaultwardenUrl()}${path}`, {
        ...init,
        headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
        },
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Vaultwarden API ${response.status}: ${body}`);
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
};
export const getAllItems = async () => {
    const payload = await requestVaultwarden('/api/sync?excludeDomains=true', { method: 'GET' });
    return payload.ciphers ?? payload.Ciphers ?? [];
};
export const findItemByName = async (name) => {
    const normalized = name.trim().toLowerCase();
    const items = await getAllItems();
    return items.find((item) => getItemName(item).trim().toLowerCase() === normalized);
};
export const createLoginItem = async (name, username, password) => {
    return requestVaultwarden('/api/ciphers', {
        method: 'POST',
        body: JSON.stringify({
            type: 1,
            name,
            notes: '',
            favorite: false,
            login: {
                username,
                password,
                totp: null,
                uris: [],
            },
            secureNote: null,
            card: null,
            identity: null,
            folderId: null,
            organizationId: null,
            collectionIds: [],
        }),
    });
};
export const deleteItemById = async (id) => {
    await requestVaultwarden(`/api/ciphers/${id}`, { method: 'DELETE' });
};
export const generatePassword = (length = 20) => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+=?';
    const bytes = webcrypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};
export { getItemId, getItemName };
