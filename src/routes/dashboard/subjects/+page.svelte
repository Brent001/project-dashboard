<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import AddSubjectModal from '$lib/component/AddSubjectModal.svelte';
  import { fly } from 'svelte/transition';

  export let data: {
    staffId?: string;
    staffName?: string;
    role?: string;
    pictureUrl?: string;
    subjects?: Array<{
      id: string;
      code: string;
      name: string;
      units: number;
      yearLevelId: string;
    }>;
  };

  interface Subject {
    id: string;
    code: string;
    name: string;
    units: number;
    yearLevelId: string;
    showActions: boolean;
  }

  interface YearLevel {
    id: string;
    name: string;
  }

  // Destructure all returned data with proper types
  const { staffId = '', staffName = '', role = '', pictureUrl = '', subjects: rawSubjects = [] } = data ?? {};
  
  // Initialize subjects with showActions property
  let subjects: Subject[] = rawSubjects.map((s): Subject => ({
    ...s,
    showActions: false
  }));

  // Hardcoded year levels with proper typing
  const yearLevels: YearLevel[] = [
    { id: '1', name: '1st Year' },
    { id: '2', name: '2nd Year' },
    { id: '3', name: '3rd Year' },
    { id: '4', name: '4th Year' }
  ];

  // State variables
  let sidebarOpen: boolean = false;
  let sidebarCollapsed: boolean = true;
  let searchQuery: string = '';
  let showAddModal: boolean = false;

  // Reactive statement for filtered subjects
  $: filteredSubjects = subjects.filter((subject: Subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Event handlers
  function toggleSidebar(): void {
    sidebarOpen = !sidebarOpen;
  }

  function toggleSidebarCollapsed(): void {
    sidebarCollapsed = !sidebarCollapsed;
  }

  function closeSidebar(): void {
    sidebarOpen = false;
  }

  function addSubject(): void {
    showAddModal = true;
  }

  function handleModalClose(): void {
    showAddModal = false;
  }

  async function handleSubjectAdded(): Promise<void> {
    showAddModal = false;
    try {
      const res = await fetch('/api/subjects', { credentials: 'include' });
      if (res.ok) {
        const newSubjects = await res.json();
        subjects = newSubjects.map((s: any): Subject => ({
          ...s,
          showActions: false
        }));
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  }

  function editSubject(subjectId: string): void {
    window.location.href = `/dashboard/subjects/edit?id=${subjectId}`;
  }

  async function deleteSubject(subjectId: string, name: string): Promise<void> {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const response = await fetch('/api/subjects', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: subjectId }),
          credentials: 'include'
        });
        
        if (response.ok) {
          await handleSubjectAdded();
        } else {
          console.error('Failed to delete subject');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  }

  function toggleSubjectActions(index: number, event: Event): void {
    event.stopPropagation();
    subjects = subjects.map((s: Subject, i: number): Subject => ({
      ...s,
      showActions: i === index ? !s.showActions : false
    }));
  }

  function handleKeyDown(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  function getYearLevelName(yearLevelId: string): string {
    const yearLevel = yearLevels.find((y: YearLevel) => y.id === yearLevelId);
    return yearLevel ? yearLevel.name : yearLevelId;
  }
</script>

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <!-- For sidebar width, use: -->
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffId} {staffName} {role} {closeSidebar} {sidebarCollapsed} {pictureUrl} />
    </div>
  </aside>

  <!-- Sidebar overlay for mobile with fly animation -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <!-- Overlay backdrop -->
      <button
        class="fixed inset-0 bg-black opacity-40 cursor-pointer"
        aria-label="Close sidebar overlay"
        on:click={closeSidebar}
        on:keydown={(e) => handleKeyDown(e, closeSidebar)}
      />
      <div
        class="relative z-50 w-64 h-full bg-white dark:bg-gray-900 transition-all duration-300"
        transition:fly={{ x: -300, duration: 300 }}
        on:click|stopPropagation
        role="dialog"
        aria-modal="true"
        aria-label="Navigation sidebar"
      >
        <Sidebar {staffId} {staffName} {role} {closeSidebar} sidebarCollapsed={false} {pictureUrl} />
      </div>
    </div>
  {/if}

  <div class="flex-1 flex flex-col min-w-0">
    <Navbar
      {staffId}
      {staffName}
      {role}
      {sidebarOpen}
      {toggleSidebar}
      {sidebarCollapsed}
      {toggleSidebarCollapsed}
      {pictureUrl}
    />

    <main class="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white">Subjects</h1>
          <p class="text-blue-600 dark:text-blue-400 mt-1">{filteredSubjects.length} subjects found</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            on:click={addSubject}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Subject
          </button>
        </div>
      </div>

      <!-- Search Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              bind:value={searchQuery}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              aria-label="Search subjects"
            />
          </div>
        </div>
      </div>

      <!-- Subjects Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full" role="table">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                  Code
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                  Name
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                  Units
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                  Year Level
                </th>
                <th class="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {#if filteredSubjects.length === 0}
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 01-2 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2m12 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4"/>
                      </svg>
                      <p class="text-lg font-medium">No subjects found</p>
                      <p class="text-sm">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each filteredSubjects as subject, index (subject.id)}
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {subject.code}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {subject.name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {subject.units}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getYearLevelName(subject.yearLevelId)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <!-- Actions dropdown -->
                      <div class="relative inline-block text-left">
                        <button
                          type="button"
                          class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          on:click={(e) => toggleSubjectActions(index, e)}
                          on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleSubjectActions(index, e);
                            }
                          }}
                          aria-haspopup="true"
                          aria-expanded={subject.showActions}
                          aria-label="Subject actions for {subject.name}"
                        >
                          Actions
                          <svg class="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06 0L10 10.439l3.71-3.23a.75.75 0 111.04 1.08l-4.25 3.625a.75.75 0 01-1.04 0l-4.25-3.625a.75.75 0 010-1.08z" clip-rule="evenodd" />
                          </svg>
                        </button>
                        
                        {#if subject.showActions}
                          <div class="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg" role="menu" aria-orientation="vertical">
                            <div class="rounded-md bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                              <div class="py-1">
                                <!-- Edit action -->
                                <button
                                  type="button"
                                  on:click={() => editSubject(subject.id)}
                                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                  role="menuitem"
                                >
                                  <svg class="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.581 13.42a4 4 0 00-.886 1.343z" />
                                  </svg>
                                  Edit
                                </button>

                                <!-- Delete action -->
                                <button
                                  type="button"
                                  on:click={() => deleteSubject(subject.id, subject.name)}
                                  class="flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                                  role="menuitem"
                                >
                                  <svg class="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Add Subject Modal -->
      <AddSubjectModal
        open={showAddModal}
        {yearLevels}
        on:close={handleModalClose}
        on:added={handleSubjectAdded}
      />
    </main>
  </div>
</div>