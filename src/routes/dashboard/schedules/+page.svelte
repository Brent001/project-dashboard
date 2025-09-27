<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  export let data;

  type Schedule = {
    id: string;
    subjectName: string;
    subjectCode: string;
    teacherName: string;
    academicTerm: string;
    section: string;
    day: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  };

  let { staffId, staffName, role, pictureUrl, schedules = [] } = data as {
    staffId: string;
    staffName: string;
    role: string;
    pictureUrl: string;
    schedules: Schedule[];
  };

  let sidebarOpen = false;
  let sidebarCollapsed = true;
  let filterDrawerOpen = false;
  let searchQuery = '';
  let selectedTerm = '';
  let selectedSection = '';
  let selectedSubject = '';

  // Generate filter options
  let terms = Array.from(new Set(schedules.map(s => s.academicTerm))).filter(Boolean);
  let sections = Array.from(new Set(schedules.map(s => s.section))).filter(Boolean);
  let subjects = Array.from(new Set(schedules.map(s => s.subjectName))).filter(Boolean);

  $: filteredSchedules = schedules.filter((s: Schedule) => {
    const matchesSearch =
      s.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTerm = !selectedTerm || s.academicTerm === selectedTerm;
    const matchesSection = !selectedSection || s.section === selectedSection;
    const matchesSubject = !selectedSubject || s.subjectName === selectedSubject;
    return matchesSearch && matchesTerm && matchesSection && matchesSubject;
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
  function openFilterDrawer() {
    filterDrawerOpen = true;
  }
  function closeFilterDrawer() {
    filterDrawerOpen = false;
  }
  function resetFilters() {
    selectedTerm = '';
    selectedSection = '';
    selectedSubject = '';
    searchQuery = '';
  }

  function addSchedule() {
    window.location.href = '/dashboard/schedules/add-schedule';
  }
  function viewSchedule(id: string) {
    window.location.href = `/dashboard/schedules/view?id=${id}`;
  }
  function editSchedule(id: string) {
    window.location.href = `/dashboard/schedules/edit?id=${id}`;
  }
</script>

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffId} {staffName} {role} {closeSidebar} {sidebarCollapsed} pictureUrl={pictureUrl} />
    </div>
  </aside>

  <!-- Sidebar overlay for mobile with fly animation -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <div class="fixed inset-0 bg-black opacity-40" on:click={closeSidebar}></div>
      <div
        class="relative z-50 w-64 h-full bg-white dark:bg-gray-900 transition-all duration-300"
        transition:fly={{ x: -300, duration: 300 }}
        on:click|stopPropagation
      >
        <Sidebar {staffId} {staffName} {role} {closeSidebar} sidebarCollapsed={false} pictureUrl={pictureUrl} />
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
      pictureUrl={pictureUrl}
    />

    <main class="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white">Schedules</h1>
          <p class="text-blue-600 dark:text-blue-400 mt-1">{filteredSchedules.length} schedules found</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            on:click={addSchedule}
          >
            + Add Schedule
          </button>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              type="text"
              class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Search by subject, teacher, section..."
              bind:value={searchQuery}
            />
          </div>
          <button
            class="md:hidden px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            on:click={openFilterDrawer}
          >
            Filters
          </button>
          <div class="hidden md:flex gap-3">
            <select class="px-3 py-2 rounded border" bind:value={selectedTerm}>
              <option value="">All Terms</option>
              {#each terms as term}
                <option value={term}>{term}</option>
              {/each}
            </select>
            <select class="px-3 py-2 rounded border" bind:value={selectedSection}>
              <option value="">All Sections</option>
              {#each sections as section}
                <option value={section}>{section}</option>
              {/each}
            </select>
            <select class="px-3 py-2 rounded border" bind:value={selectedSubject}>
              <option value="">All Subjects</option>
              {#each subjects as subject}
                <option value={subject}>{subject}</option>
              {/each}
            </select>
            <button class="px-3 py-2 rounded bg-gray-100" on:click={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      <!-- Filter Drawer for Mobile -->
      {#if filterDrawerOpen}
        <div class="fixed inset-0 z-50 md:hidden">
          <div class="fixed inset-0 bg-black/50" on:click={closeFilterDrawer}></div>
          <div class="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto">
            <h2 class="text-lg font-semibold mb-4">Filters</h2>
            <div class="mb-4">
              <label class="block mb-1">Term</label>
              <select class="w-full px-3 py-2 rounded border" bind:value={selectedTerm}>
                <option value="">All Terms</option>
                {#each terms as term}
                  <option value={term}>{term}</option>
                {/each}
              </select>
            </div>
            <div class="mb-4">
              <label class="block mb-1">Section</label>
              <select class="w-full px-3 py-2 rounded border" bind:value={selectedSection}>
                <option value="">All Sections</option>
                {#each sections as section}
                  <option value={section}>{section}</option>
                {/each}
              </select>
            </div>
            <div class="mb-4">
              <label class="block mb-1">Subject</label>
              <select class="w-full px-3 py-2 rounded border" bind:value={selectedSubject}>
                <option value="">All Subjects</option>
                {#each subjects as subject}
                  <option value={subject}>{subject}</option>
                {/each}
              </select>
            </div>
            <button class="w-full px-3 py-2 rounded bg-gray-100" on:click={resetFilters}>Reset</button>
            <button class="w-full mt-2 px-3 py-2 rounded bg-blue-600 text-white" on:click={closeFilterDrawer}>Apply</button>
          </div>
        </div>
      {/if}

      <!-- Table View -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Teacher</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Term</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Section</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Day</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each filteredSchedules as schedule}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.subjectName}</td>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.subjectCode}</td>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.teacherName}</td>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.academicTerm}</td>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.section}</td>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.day}</td>
                <td class="px-6 py-4 whitespace-nowrap">{schedule.startTime} - {schedule.endTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {#if schedule.isActive}
                    <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Active</span>
                  {:else}
                    <span class="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">Inactive</span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="relative">
                    <button
                      class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      on:click={() => viewSchedule(schedule.id)}
                    >
                      View
                    </button>
                    <button
                      class="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      on:click={() => editSchedule(schedule.id)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
            {#if filteredSchedules.length === 0}
              <tr>
                <td colspan="9" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No schedules found.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </main>
  </div>
</div>