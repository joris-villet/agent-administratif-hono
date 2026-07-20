import { refreshAccessToken } from '../../apiGmail/refreshToken';
const SHEET_ID = '1YeEjXiGb1ovhGhfxJTIwnsFrm1wYljI5TbBDxYZwE3Q';
export const readSheet = async ({ month, cell, }) => {
    const accessToken = await refreshAccessToken();
    const range = `${month}!${cell}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    const value = data.values?.[0]?.[0] ?? 'vide';
    return `${range} = ${value}`;
};
