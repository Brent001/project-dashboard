import CryptoJS from 'crypto-js';
import { env } from '$env/dynamic/private';

const ENCRYPTION_KEY = env.VITE_PUBLIC_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not set');
const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);

export function encrypt(text: string): string {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedDataHex] = encryptedText.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const encryptedData = CryptoJS.enc.Hex.parse(encryptedDataHex);

  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: encryptedData
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}