<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onDestroy } from 'svelte';

  export let currentPicture: string = '';
  export let staffId: string = '';

  let previewUrl = '';
  let error = '';
  let uploading = false;
  let fileInput: HTMLInputElement;
  let dragActive = false;

  const dispatch = createEventDispatcher();

  function handleFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  }

  function processFile(file: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    error = '';
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
    const files = event.dataTransfer?.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      processFile(files[0]);
      // Update file input to reflect the dropped file
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      fileInput.files = dt.files;
    }
  }

  async function uploadProfilePicture() {
    if (!fileInput.files?.[0]) {
      error = 'Please select an image.';
      return;
    }
    if (!staffId) {
      error = 'Invalid staff ID. Please refresh the page.';
      return;
    }
    uploading = true;
    error = '';
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('username', staffId);

    try {
      const uploadRes = await fetch('/api/pic_api', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        error = `Upload failed: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`;
        uploading = false;
        return;
      }

      const uploadJson = await uploadRes.json();
      if (!uploadJson.success || !uploadJson.data?.public_id || !uploadJson.data?.url) {
        error = uploadJson.error || 'Upload failed. Please try again.';
        uploading = false;
        return;
      }

      const saveRes = await fetch('/api/update_profile_picture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pictureId: uploadJson.data.public_id,
          pictureUrl: uploadJson.data.url
        })
      });

      if (!saveRes.ok) {
        const errorText = await saveRes.text();
        error = `Save failed: ${saveRes.status} ${saveRes.statusText} - ${errorText}`;
        uploading = false;
        return;
      }

      const saveJson = await saveRes.json();
      if (!saveJson.success) {
        error = saveJson.error || 'Failed to save profile picture.';
        uploading = false;
        return;
      }

      dispatch('update', { url: uploadJson.data.url });
      uploading = false;
      previewUrl = '';
      if (fileInput) fileInput.value = '';
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      successDiv.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span>Profile picture updated successfully!</span>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (e) {
      error = 'Upload failed. Please try again.';
      uploading = false;
    }
  }

  function cancelUpload() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = '';
    if (fileInput) fileInput.value = '';
    error = '';
  }

  onDestroy(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  });
</script>

<div class="flex flex-col items-start w-full space-y-3 sm:space-y-4">
  <!-- Profile Picture Display -->
  <div class="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow">
    <img
      src={previewUrl || currentPicture || '/default-avatar.png'}
      alt="Profile"
      class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
      on:error={() => currentPicture = '/default-avatar.png'}
    />
    <!-- Camera Icon Overlay -->
    <label
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      tabindex="0"
      aria-label="Change profile picture"
    >
      <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <input
        type="file"
        accept="image/*"
        bind:this={fileInput}
        class="hidden"
        on:change={handleFileChange}
        aria-label="Select profile picture"
      />
    </label>
  </div>

  <!-- Upload Guidelines -->
  <div class="text-left text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">
    <p>Recommended: Square, ≥200x200px</p>
    <p>Max: 5MB • JPG, PNG, GIF</p>
  </div>

  <!-- Drag and Drop Area (when no preview and no current picture) -->
  {#if !previewUrl && !currentPicture}
    <div 
      class={`border-2 border-dashed rounded-lg p-2 sm:p-4 text-left transition-all duration-200 ${
        dragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
      }`}
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
      role="button"
      tabindex="0"
      aria-label="Drag and drop image"
    >
      <div class="flex items-center gap-2 sm:gap-3">
        <svg class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        <div>
          <p class="text-gray-600 dark:text-gray-400 text-[11px] sm:text-xs">Drag & drop image</p>
          <label class="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer mt-1 sm:mt-2 text-[11px] sm:text-xs">
            <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Browse
            <input
              type="file"
              accept="image/*"
              bind:this={fileInput}
              class="hidden"
              on:change={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  {/if}

  <!-- Action Buttons (when preview exists) -->
  {#if previewUrl}
    <div class="flex gap-2 w-full max-w-xs mt-1 sm:mt-2">
      <button
        class="flex-1 px-2 py-1 sm:px-3 sm:py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-[11px] sm:text-sm"
        on:click={uploadProfilePicture}
        disabled={uploading}
        aria-busy={uploading}
      >
        {#if uploading}
          <svg class="animate-spin w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Uploading...</span>
        {:else}
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>Save</span>
        {/if}
      </button>
      <button
        class="px-2 py-1 sm:px-3 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-[11px] sm:text-sm"
        on:click={cancelUpload}
        disabled={uploading}
      >
        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>Cancel</span>
      </button>
    </div>
  {/if}

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-start gap-2 w-full max-w-xs mt-1 sm:mt-2 text-[11px] sm:text-xs" role="alert">
      <svg class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{error}</span>
    </div>
  {/if}
</div>