<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let student: any = null;
  let loading = true;
  let error = '';

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  $: studNo = $page.url.searchParams.get('id');

  onMount(async () => {
    loading = true;
    error = '';
    try {
      const res = await fetch(`/api/students/view/${studNo}`);
      const json = await res.json();
      if (json.student) {
        student = json.student;
      } else {
        error = 'Student not found';
      }
    } catch (e) {
      error = 'Failed to load student data';
    }
    loading = false;
  });

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

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar sidebarCollapsed={sidebarCollapsed} closeSidebar={closeSidebar} />
    </div>
  </aside>
  <!-- Sidebar overlay for mobile -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <div class="fixed inset-0 bg-black opacity-40" on:click={closeSidebar}></div>
      <div
        class="relative z-50 w-64 h-full bg-white dark:bg-gray-900 transition-all duration-300"
        on:click|stopPropagation
      >
        <Sidebar sidebarCollapsed={false} closeSidebar={closeSidebar} />
      </div>
    </div>
  {/if}

  <div class="flex-1 flex flex-col min-w-0">
    <Navbar
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      sidebarCollapsed={sidebarCollapsed}
      toggleSidebarCollapsed={toggleSidebarCollapsed}
    />

    <main class="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div class="max-w-3xl mx-auto">
        {#if loading}
          <div class="text-center py-20 text-blue-600 dark:text-blue-300">Loading student info...</div>
        {:else if error}
          <div class="text-center py-20 text-red-600 dark:text-red-400">{error}</div>
        {:else if student}
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div class="flex flex-col md:flex-row items-center gap-8">
              <img
                src={student.pictureUrl ?? '/default-avatar.png'}
                alt="Student Photo"
                class="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
              />
              <div class="flex-1">
                <h1 class="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white mb-2">
                  {student.firstName} {student.lastName}
                </h1>
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Student ID: <span class="font-mono">{student.studNo}</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {student.course}
                  </span>
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    Year: {student.yearLevel}
                  </span>
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                    Section: {student.section}
                  </span>
                </div>
                <div class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Gender: {student.gender ?? 'N/A'} &bull; Age: {student.age ?? 'N/A'}
                </div>
                <div class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Contact: {student.contactNumber ?? 'N/A'}
                </div>
                <div class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Address: {student.address ?? 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-blue-900 dark:text-white mb-4">Family & Guardian Info</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Guardian</div>
                <div class="text-sm text-gray-900 dark:text-white">{student.guardian ?? 'N/A'}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 mt-2">Guardian Phone</div>
                <div class="text-sm text-gray-900 dark:text-white">{student.guardianPhone ?? 'N/A'}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Mother</div>
                <div class="text-sm text-gray-900 dark:text-white">{student.mother ?? 'N/A'}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 mt-2">Father</div>
                <div class="text-sm text-gray-900 dark:text-white">{student.father ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>