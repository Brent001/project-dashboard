<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    name: '',
    startDate: '',
    endDate: '',
    isActive: false
  };
  
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';

  function closeModal() {
    if (!isSubmitting) {
      isOpen = false;
      resetForm();
      dispatch('close');
    }
  }

  function resetForm() {
    formData = {
      name: '',
      startDate: '',
      endDate: '',
      isActive: false
    };
    errors = {};
    successMessage = '';
    errorMessage = '';
  }

  function validateForm() {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Academic term name is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      const response = await fetch('/api/academic-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        successMessage = 'Academic term created successfully!';
        dispatch('success', data.term);
        
        // Close modal after short delay
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        errorMessage = data.error || 'Failed to create academic term';
      }
    } catch (error) {
      console.error('Error creating academic term:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isSubmitting) {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      on:click={closeModal}
      role="button"
      tabindex="0"
      aria-label="Close modal"
    ></div>
    
    <!-- Modal -->
    <div 
      class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      transition:fly={{ y: 20, duration: 300 }}
      on:click|stopPropagation
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Add Academic Term</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create a new academic term/semester</p>
            </div>
          </div>
          <button
            on:click={closeModal}
            disabled={isSubmitting}
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit} class="px-6 py-5 space-y-5">
        <!-- Success Message -->
        {#if successMessage}
          <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center gap-3">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</span>
          </div>
        {/if}
        
        <!-- Error Message -->
        {#if errorMessage}
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center gap-3">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</span>
          </div>
        {/if}

        <!-- Term Name -->
        <div>
          <label for="term-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Term Name <span class="text-red-500">*</span>
          </label>
          <input
            id="term-name"
            type="text"
            bind:value={formData.name}
            placeholder="e.g., Fall 2024, 1st Semester 2024-2025"
            disabled={isSubmitting}
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all
              {errors.name ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
              dark:bg-gray-700 dark:text-white placeholder-gray-400"
          />
          {#if errors.name}
            <p class="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          {/if}
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Start Date -->
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date <span class="text-red-500">*</span>
            </label>
            <input
              id="start-date"
              type="date"
              bind:value={formData.startDate}
              disabled={isSubmitting}
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all
                {errors.startDate ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                dark:bg-gray-700 dark:text-white"
            />
            {#if errors.startDate}
              <p class="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
            {/if}
          </div>

          <!-- End Date -->
          <div>
            <label for="end-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date <span class="text-red-500">*</span>
            </label>
            <input
              id="end-date"
              type="date"
              bind:value={formData.endDate}
              disabled={isSubmitting}
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all
                {errors.endDate ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                dark:bg-gray-700 dark:text-white"
            />
            {#if errors.endDate}
              <p class="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
            {/if}
          </div>
        </div>

        <!-- Active Status -->
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formData.isActive}
              disabled={isSubmitting}
              class="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <div class="flex-1">
              <span class="block text-sm font-medium text-gray-900 dark:text-white">Set as Active Term</span>
              <span class="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                This will deactivate all other academic terms and make this the current active term
              </span>
            </div>
          </label>
        </div>

        <!-- Info Note -->
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Academic terms are used to organize student grades and schedules. Only one term can be active at a time.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            on:click={closeModal}
            disabled={isSubmitting}
            class="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {#if isSubmitting}
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create Term
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}