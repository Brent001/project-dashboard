<script>
  import { page } from '$app/stores';
  import { darkMode } from '$lib/stores/darkMode.js';
  import { onMount } from 'svelte';

  export let staffId = "";
  export let staffName = "";
  export let role = "";
  export let closeSidebar = () => {};
  export let sidebarCollapsed = false;
  export let pictureUrl = "";

  let resolvedPictureUrl = pictureUrl || '/default-avatar.png';

  onMount(() => {
    if ((!pictureUrl || pictureUrl === '') && staffId) {
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
    }
  });

  function handleImgError() {
    resolvedPictureUrl = '/default-avatar.png';
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7l9 6 9-6' },
    { href: '/students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { href: '/schedules', label: 'Schedules', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/staff', label: 'Staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  $: currentPath = $page.url.pathname;

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
</script>

<aside class="h-screen flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all duration-300 bg-white dark:bg-gray-900"
  class:w-20={sidebarCollapsed}
  class:w-64={!sidebarCollapsed}
>
  <!-- Header -->
  <div class="relative p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
    <!-- Mobile close button -->
    <button
      on:click={closeSidebar}
      class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
      aria-label="Close sidebar"
    >
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
    <div class="flex items-center space-x-3 mb-4">
      <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      </div>
      {#if !sidebarCollapsed}
        <div class="transition-opacity duration-300 opacity-100">
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">EduPortal</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Management System</p>
        </div>
      {/if}
    </div>
    {#if staffName && role}
      {#if !sidebarCollapsed}
        <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-full transform transition-all duration-300 translate-x-0 opacity-100">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
              {#if resolvedPictureUrl && resolvedPictureUrl !== '/default-avatar.png'}
                <img
                  src={resolvedPictureUrl}
                  alt="Profile"
                  class="w-12 h-12 object-cover rounded-full"
                  on:error={handleImgError}
                />
              {:else}
                {getInitials(staffName)}
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{staffName}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
            </div>
          </div>
        </div>
      {:else}
        <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-full transform transition-all duration-300 -translate-x-full opacity-0 absolute">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
              {#if resolvedPictureUrl && resolvedPictureUrl !== '/default-avatar.png'}
                <img
                  src={resolvedPictureUrl}
                  alt="Profile"
                  class="w-12 h-12 object-cover rounded-full"
                  on:error={handleImgError}
                />
              {:else}
                {getInitials(staffName)}
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{staffName}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
    {#each menuItems as item}
      <a 
        href={item.href}
        on:click={closeSidebar}
        class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
          {currentPath === item.href 
            ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
          {sidebarCollapsed ? 'justify-center' : ''}"
      >
        <div class="flex-shrink-0 w-6 h-6">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d={item.icon}/>
          </svg>
        </div>
        {#if !sidebarCollapsed}
          <span class="flex-1 ml-3 transition-opacity duration-300 opacity-100">{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Footer -->
  {#if !sidebarCollapsed}
    <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 transition-opacity duration-300 opacity-100">
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
        System Status: <span class="text-green-500 font-medium">●</span> Online
      </div>
      <button
        class="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
        on:click={handleLogout}
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Sign Out
      </button>
    </div>
  {/if}
</aside>