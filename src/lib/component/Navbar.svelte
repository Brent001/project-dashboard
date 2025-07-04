<script>
  import { onMount } from 'svelte';
  import { darkMode } from '$lib/stores/darkMode.js';

  export let staffId = "";
  export let staffName = "";
  export let role = "";
  export let sidebarOpen = false;
  export let toggleSidebar = () => {};
  export let sidebarCollapsed = false;
  export let toggleSidebarCollapsed = () => {};
  export let pictureUrl = "";

  let currentTime = new Date();
  let showProfile = false;

  let resolvedPictureUrl = pictureUrl;

  // If no pictureUrl from DB or it's empty, fetch from public API
  $: if ((!pictureUrl || pictureUrl === '') && staffId) {
    fetch(`/api/public_url?id=${staffId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.pictureUrl) {
          resolvedPictureUrl = data.pictureUrl;
        } else {
          resolvedPictureUrl = '/default-avatar.png';
        }
      })
      .catch(() => {
        resolvedPictureUrl = '/default-avatar.png';
      });
  } else {
    resolvedPictureUrl = pictureUrl || '/default-avatar.png';
  }

  function handleImgError() {
    resolvedPictureUrl = '/default-avatar.png';
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  }

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 60000);
    return () => clearInterval(interval);
  });

  function toggleDarkMode() {
    darkMode.update(v => !v);
  }

  function getGreeting() {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function formatTime() {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatDate() {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between sticky top-0 z-30">
  <!-- Left: Sidebar toggle and title -->
  <div class="flex items-center gap-3">
    <!-- Mobile sidebar toggle -->
    <button
      class="md:hidden p-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      on:click={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
    <!-- Desktop sidebar collapse/expand -->
    <button
      class="hidden md:inline-flex p-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      on:click={toggleSidebarCollapsed}
      aria-label="Collapse sidebar"
    >
      {#if sidebarCollapsed}
        <!-- Expand icon -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      {:else}
        <!-- Collapse icon -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      {/if}
    </button>
    <span class="font-semibold text-lg text-blue-900 dark:text-white">College Dashboard</span>
  </div>

  <!-- Center: Greeting and time/date -->
  <div class="hidden md:flex flex-col items-center">
    <span class="text-sm text-gray-700 dark:text-gray-200">{getGreeting()}, {staffName}!</span>
    <span class="text-xs text-gray-500 dark:text-gray-400">{formatDate()} • {formatTime()}</span>
  </div>

  <!-- Right: Dark mode and profile -->
  <div class="flex items-center gap-3">
    <div class="relative">
      <button
        class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        on:click={() => showProfile = !showProfile}
        aria-label="Profile menu"
      >
        <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold overflow-hidden">
          {#if resolvedPictureUrl}
            <img src={resolvedPictureUrl} alt="Profile" class="w-8 h-8 object-cover rounded-full" on:error={handleImgError} />
          {:else}
            {staffName ? staffName.charAt(0).toUpperCase() : 'U'}
          {/if}
        </div>
        <span class="hidden md:block text-sm text-gray-900 dark:text-white">{staffName}</span>
        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {#if showProfile}
        <div class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow border border-gray-200 dark:border-gray-700 z-50">
          <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
          <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</a>
          <button
            class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            on:click={handleLogout}
          >Sign Out</button>
        </div>
        <div class="fixed inset-0 z-40" on:click={() => showProfile = false}></div>
      {/if}
    </div>
  </div>
</nav>