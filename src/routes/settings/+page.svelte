<script lang="ts">
  import Navbar from '$lib/component/Navbar.svelte';
  import Sidebar from '$lib/component/Sidebar.svelte';
  import { goto } from '$app/navigation';

  export let data: {
    staffId?: string;
    staffName?: string;
    role?: string;
    pictureId?: string;
    pictureUrl?: string;
  };

  let staffId = data?.staffId ?? '';
  let staffName = data?.staffName ?? 'User';
  let role = data?.role ?? '';
  let currentPicture = data?.pictureUrl ?? '';

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  let uploading = false;
  let error = '';
  let previewUrl = '';
  let fileInput: HTMLInputElement;

  function toggleSidebar() { sidebarOpen = !sidebarOpen; }
  function toggleSidebarCollapsed() { sidebarCollapsed = !sidebarCollapsed; }
  function closeSidebar() { sidebarOpen = false; }

  function handleFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files[0]) {
      previewUrl = URL.createObjectURL(files[0]);
      error = '';
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
    formData.append('username', staffId); // Use staffId as the image name

    try {
      // 1. Upload to Cloudinary via your API
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

      // 2. Save both public_id and url to your DB
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

      // Update UI
      currentPicture = uploadJson.data.url;
      uploading = false;
      previewUrl = '';
      if (fileInput) fileInput.value = '';
      alert('Profile picture updated!');
    } catch (e) {
      error = 'Upload failed. Please try again.';
      uploading = false;
    }
  }

  function cancelUpload() {
    previewUrl = '';
    if (fileInput) fileInput.value = '';
  }
</script>

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffId} {staffName} {role} {closeSidebar} {sidebarCollapsed} pictureUrl={currentPicture} />
    </div>
  </aside>
  <!-- Sidebar overlay for mobile -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <button
        type="button"
        aria-label="Close sidebar"
        class="fixed inset-0 bg-black opacity-40"
        on:click={closeSidebar}
        tabindex="0"
      ></button>
      <div
        class="relative z-50 w-64 h-full bg-white dark:bg-gray-900 transition-all duration-300"
        on:click|stopPropagation
      >
        <Sidebar {staffId} {staffName} {role} {closeSidebar} sidebarCollapsed={false} pictureUrl={currentPicture} />
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
      pictureUrl={currentPicture}
    />

    <main class="flex-1 flex items-center justify-center px-2 md:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <h1 class="text-3xl font-bold text-blue-900 dark:text-white mb-8 text-center">Profile Settings</h1>
        <div class="flex flex-col items-center gap-8">
          <div class="relative">
            <img
              src={previewUrl || currentPicture || '/default-avatar.png'}
              alt="Profile"
              class="w-36 h-36 rounded-full object-cover border-4 border-blue-400 shadow"
              on:error={() => currentPicture = '/default-avatar.png'}
            />
            <label class="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"/>
              </svg>
              <input
                type="file"
                accept="image/*"
                bind:this={fileInput}
                class="hidden"
                on:change={handleFileChange}
              />
            </label>
          </div>
          
          {#if previewUrl}
            <div class="flex gap-4 w-full">
              <button
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                on:click={uploadProfilePicture}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Save Profile Picture'}
              </button>
              <button
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                on:click={cancelUpload}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          {/if}
          
          {#if error}
            <div class="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>