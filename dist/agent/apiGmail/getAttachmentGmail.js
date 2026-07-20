import { PDFParse } from 'pdf-parse';
import { refreshAccessToken } from './refreshToken';
export const getAttachmentGmail = async ({ messageId, }) => {
    const accessToken = await refreshAccessToken();
    // 1. Récupérer l'email pour trouver les pièces jointes
    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const msg = await msgRes.json();
    const parts = msg.payload.parts ?? [];
    const attachment = parts.find((p) => p.filename && p.body.attachmentId);
    if (!attachment)
        return 'Aucune pièce jointe trouvée';
    console.log('📎 pièce jointe trouvée =>', attachment.filename);
    // 2. Télécharger la pièce jointe
    const attachRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachment.body.attachmentId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const attachData = await attachRes.json();
    // Google renvoie du base64 url-safe, faut le convertir
    const base64 = attachData.data.replace(/-/g, '+').replace(/_/g, '/');
    const uint8Array = new Uint8Array(Buffer.from(base64, 'base64'));
    // 3. Parser le PDF avec ton parser existant
    const parser = new PDFParse(uint8Array);
    const result = await parser.getText();
    const pdfText = result.pages.map((page) => page.text).join('\n\n');
    console.log('📄 PDF parsé =>', pdfText.slice(0, 200));
    return pdfText || 'Impossible de lire le contenu du PDF';
};
