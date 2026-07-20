// scripts/google-auth.ts
import 'dotenv/config';
import { google } from 'googleapis';
import http from "http";
import { OAuth2Client } from 'google-auth-library';
import { writeFileSync, readFileSync, existsSync } from 'fs';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = './google-token.json';
const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || 'http://localhost:000/oauth2callback');
// 1. Génère l'URL d'authentification
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // ← demande un refresh_token
    prompt: 'consent', // ← force le re-consentement (sinon pas de refresh_token)
    scope: SCOPES,
});
console.log('\n🔗 Ouvre cette URL dans ton navigateur et autorise :\n');
console.log(authUrl);
// 2. Récupère le code via l'URL de callback
const url = await new Promise((resolve) => {
    console.log('\n⏳ En attente sur http://localhost:7000/oauth2callback ...');
    const server = http.createServer(async (req, res) => {
        if (req.url?.startsWith('/oauth2callback')) {
            const code = new URL(req.url, 'http://localhost').searchParams.get('code');
            res.end('✅ OK tu peux fermer cette page.');
            server.close();
            resolve(req.url);
        }
    });
    server.listen(7000);
});
const code = new URL(url, 'http://localhost').searchParams.get('code');
if (!code)
    throw new Error('Pas de code reçu');
// 3. Échange le code contre access + refresh
const { tokens } = await oauth2Client.getToken(code);
console.log('\n✅ Tokens reçus !');
console.log('access_token:', tokens.access_token?.slice(0, 20) + '...');
console.log('refresh_token:', tokens.refresh_token ? 'OUI ✅' : '❌ MANQUANT');
if (!tokens.refresh_token) {
    console.error('\n❌ Pas de refresh_token. Révoque l\'app sur https://myaccount.google.com/permissions et relance.');
    process.exit(1);
}
// 4. Sauvegarde
writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
console.log(`\n💾 Tokens sauvés dans ${TOKEN_PATH}`);
// 5. Update le .env automatiquement
const envPath = './.env';
if (existsSync(envPath)) {
    let env = readFileSync(envPath, 'utf8');
    env = env.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    if (!env.match(/^GOOGLE_REFRESH_TOKEN=/m))
        env += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`;
    writeFileSync(envPath, env);
    console.log('✅ .env mis à jour avec GOOGLE_REFRESH_TOKEN');
}
console.log('\n🚀 Terminé ! Redémarre ton serveur (pm2 restart hono).\n');
