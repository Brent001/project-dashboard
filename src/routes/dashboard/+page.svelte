<script>
  import { slide, fly } from 'svelte/transition';
  import Navbar from '$lib/component/Navbar.svelte';
  import Sidebar from '$lib/component/Sidebar.svelte';

  export let data;

  let { staffName, role, studentCount, scheduleCount, staffCount } = data;
  let sidebarOpen = false;
  let sidebarCollapsed = true;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  function toggleSidebarCollapsed() {
    sidebarCollapsed = !sidebarCollapsed;
  }
  function closeSidebar() {
    sidebarOpen = false;
  }
</script>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffName} {role} {closeSidebar} {sidebarCollapsed} />
    </div>
  </aside>
  <!-- Sidebar overlay for mobile -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <div class="fixed inset-0 bg-black opacity-40" on:click={closeSidebar}></div>
      <div class="relative z-50 w-64 transition-all duration-300" transition:fly="{{ x: -300, duration: 300 }}">
        <Sidebar {staffName} {role} {closeSidebar} sidebarCollapsed={false} />
      </div>
    </div>
  {/if}

  <div class="flex-1 flex flex-col min-w-0">
    <Navbar
      {staffName}
      {role}
      {sidebarOpen}
      {toggleSidebar}
      {sidebarCollapsed}
      {toggleSidebarCollapsed}
    />
    <main class="flex-1 p-6 md:p-10 overflow-y-auto">
      <div class="max-w-5xl mx-auto space-y-8">
        <!-- Welcome Card -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white mb-2">
              Welcome, {staffName}
              {#if role}
                <span class="text-blue-500 text-lg font-normal">({role})</span>
              {/if}
              !
            </h2>
            <p class="text-gray-700 dark:text-gray-200 text-base">
              Manage students, schedules, and staff with ease.
            </p>
          </div>
          <!-- <img src="/college-dashboard.svg" alt="Dashboard illustration" class="w-32 h-32 hidden md:block" /> -->
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Students Card -->
          <div class="flex items-center bg-white dark:bg-gray-900 rounded-lg shadow p-5">
            <div class="flex-shrink-0 bg-blue-100 dark:bg-blue-800 rounded-full p-3 mr-4">
              <!-- Academic Cap Icon -->
              <svg class="w-7 h-7 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0c-4.418 0-8-1.79-8-4"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-900 dark:text-white">{studentCount}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Students</div>
            </div>
          </div>
          <!-- Schedules Card -->
          <div class="flex items-center bg-white dark:bg-gray-900 rounded-lg shadow p-5">
            <div class="flex-shrink-0 bg-green-100 dark:bg-green-800 rounded-full p-3 mr-4">
              <!-- Calendar Icon -->
              <svg class="w-7 h-7 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" stroke-width="2"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-900 dark:text-white">{scheduleCount}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Schedules</div>
            </div>
          </div>
          <!-- Staff Card -->
          <div class="flex items-center bg-white dark:bg-gray-900 rounded-lg shadow p-5">
            <div class="flex-shrink-0 bg-purple-100 dark:bg-purple-800 rounded-full p-3 mr-4">
              <!-- Users Icon -->
              <svg class="w-7 h-7 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0zm6 13v-2a4 4 0 00-3-3.87M3 20v-2a4 4 0 013-3.87"/>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-900 dark:text-white">{staffCount}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Staff</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>