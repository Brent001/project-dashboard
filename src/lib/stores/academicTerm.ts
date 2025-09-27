import { writable } from 'svelte/store';

export const academicTerms = [
  { id: '1st', name: '1st Semester' },
  { id: '2nd', name: '2nd Semester' },
  { id: 'summer', name: 'Summer' }
];

export const selectedAcademicTerm = writable(academicTerms[0].id);