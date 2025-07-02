import { writable } from 'svelte/store';

function getInitialDarkMode(): boolean {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
  }
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

export const darkMode = writable<boolean>(getInitialDarkMode());

darkMode.subscribe((value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('darkMode', JSON.stringify(value));
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', value);
  }
});