import CryptoJS from 'crypto-js';

// Use import.meta.env for Vite public env variables
const VITE_PUBLIC_ENCRYPTION_KEY = import.meta.env.VITE_PUBLIC_ENCRYPTION_KEY;

if (!VITE_PUBLIC_ENCRYPTION_KEY) {
  throw new Error('VITE_PUBLIC_ENCRYPTION_KEY is not set in your .env file.');
}

const key = CryptoJS.enc.Utf8.parse(VITE_PUBLIC_ENCRYPTION_KEY);

/**
 * Encrypts text using AES-256-CBC for client-side use.
 * @param text The text to encrypt.
 * @returns A string in the format "iv:encryptedData".
 */
export function encrypt(text: string): string {
  const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

/**
 * Decrypts text on the client.
 * @param encryptedText The encrypted text in "iv:encryptedData" format.
 * @returns The original decrypted text.
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedDataHex] = encryptedText.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const encryptedData = CryptoJS.enc.Hex.parse(encryptedDataHex);
  
  const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedData
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}