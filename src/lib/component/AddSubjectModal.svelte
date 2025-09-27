<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let open = false;
  export let yearLevels: { id: string; name: string }[] = [];

  const dispatch = createEventDispatcher();

  let code = '';
  let name = '';
  let units = 3;
  let yearLevelId = '';
  let selectedYearLevel = '';
  let error = '';
  let saving = false;

  let yearLevelDropdownOpen = false;

  function close() {
    dispatch('close');
    // Reset form
    code = '';
    name = '';
    units = 3;
    yearLevelId = '';
    selectedYearLevel = '';
    error = '';
    saving = false;
  }

  function selectYearLevel(level: { id: string; name: string }) {
    yearLevelId = level.id;
    selectedYearLevel = level.name;
    yearLevelDropdownOpen = false;
  }

  function toggleYearLevelDropdown() {
    yearLevelDropdownOpen = !yearLevelDropdownOpen;
  }

  function closeDropdowns() {
    yearLevelDropdownOpen = false;
  }

  // Close dropdowns when clicking outside
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      closeDropdowns();
    }
  }

  // Close dropdowns on Escape key
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDropdowns();
    }
  }

  async function handleSubmit() {
    if (saving) return;
    error = '';
    saving = true;

    if (!code.trim() || !name.trim() || !yearLevelId) {
      error = 'All fields are required.';
      saving = false;
      return;
    }

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(), 
          name: name.trim(), 
          units, 
          yearLevelId
        }),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (res.ok) {
        dispatch('added');
        close();
      } else {
        error = data.error || 'Failed to add subject.';
      }
    } catch (err) {
      console.error('Network error:', err);
      error = 'Network error. Please try again.';
    }
    saving = false;
  }
</script>

<svelte:window on:click={handleOutsideClick} on:keydown={handleKeyDown} />

{#if open}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1" 
    transition:fly={{ opacity: 0, duration: 300 }}
    on:click={close}
  >
    <!-- Modal Container - Responsive sizing -->
    <div 
      class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden"
      transition:scale={{ start: 0.9, opacity: 0, duration: 300, easing: quintOut }}
      on:click|stopPropagation
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Add New Subject</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Create a new subject for the curriculum</p>
          </div>
        </div>
        <button 
          class="p-2 hover:bg-white/70 dark:hover:bg-gray-800 rounded-xl transition-colors" 
          aria-label="Close" 
          on:click={close}
        >
          <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Scrollable Content Area -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Form Content -->
        <div class="p-6">
          {#if error}
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          {/if}

          <form role="form" on:submit|preventDefault={handleSubmit}>
            <!-- Two Column Grid on Desktop, Single Column on Mobile -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Left Column -->
              <div class="space-y-5">
                <!-- Subject Code -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3" for="code">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                      </svg>
                      Subject Code
                      <span class="text-red-500">*</span>
                    </div>
                  </label>
                  <input 
                    id="code" 
                    type="text" 
                    bind:value={code} 
                    placeholder="e.g., MATH101, CS201"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all text-base"
                    required 
                  />
                </div>

                <!-- Subject Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3" for="name">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Subject Name
                      <span class="text-red-500">*</span>
                    </div>
                  </label>
                  <input 
                    id="name" 
                    type="text" 
                    bind:value={name} 
                    placeholder="e.g., College Algebra, Data Structures"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all text-base"
                    required 
                  />
                </div>

                <!-- Units -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3" for="units">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      Units
                    </div>
                  </label>
                  <div class="relative">
                    <input 
                      id="units" 
                      type="number" 
                      min="1" 
                      max="10" 
                      bind:value={units} 
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all text-base"
                      required 
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span class="text-sm text-gray-500 dark:text-gray-400">credit hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-5">
                <!-- Year Level - Custom Dropdown -->
                <div class="dropdown-container">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2"/>
                      </svg>
                      Year Level
                      <span class="text-red-500">*</span>
                    </div>
                  </label>
                  <div class="relative">
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={yearLevelDropdownOpen}
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between text-base"
                      on:click={toggleYearLevelDropdown}
                    >
                      <span class="text-gray-900 dark:text-white truncate">
                        {selectedYearLevel || 'Select year level...'}
                      </span>
                      <svg class="w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 {yearLevelDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    
                    {#if yearLevelDropdownOpen}
                      <div 
                        class="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                        transition:fly={{ y: -10, duration: 200 }}
                        role="listbox"
                      >
                        {#each yearLevels as level}
                          <button
                            type="button"
                            class="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white transition-colors flex items-center gap-3 text-base"
                            on:click={() => selectYearLevel(level)}
                          >
                            <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                            <span class="truncate">{level.name}</span>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Active Status -->
                <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/10 rounded-xl border border-gray-200 dark:border-gray-700">
                  <input 
                    id="isActive" 
                    type="checkbox" 
                    class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label for="isActive" class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div>
                        <div class="font-semibold">Active Subject</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Subject will be available for enrollment</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer - Fixed at bottom -->
      <div class="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button 
          type="button"
          class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-base"
          on:click={close}
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          on:click={handleSubmit}
          disabled={saving}
        >
          {#if saving}
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Subject...
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Subject
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}