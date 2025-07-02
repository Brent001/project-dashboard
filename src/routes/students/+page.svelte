<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { fly } from 'svelte/transition';

  export let data;

  let sidebarOpen = false;
  let sidebarCollapsed = true;
  let filterDrawerOpen = false;

  // Filter state
  let selectedCourse = '';
  let selectedYear = '';
  let selectedSection = '';

  // Use students from server data
  let students = data.students ?? [];

  // Use staffName and role from server data
  let staffName = data.staffName ?? 'Student';
  let role = data.role ?? 'student';

  // Generate filter options from students data
  let courses = Array.from(new Set(students.map(s => s.course))).filter(Boolean);
  let years = Array.from(new Set(students.map(s => s.year))).filter(Boolean);
  let sections = Array.from(new Set(students.map(s => s.section))).filter(Boolean);

  $: filteredStudents = students.filter(s =>
    (!selectedCourse || s.course === selectedCourse) &&
    (!selectedYear || s.year === selectedYear) &&
    (!selectedSection || s.section === selectedSection)
  );

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
    selectedCourse = '';
    selectedYear = '';
    selectedSection = '';
  }
</script>

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffName} {role} {closeSidebar} {sidebarCollapsed} />
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

    <main class="flex-1 overflow-y-auto px-2 md:px-8 py-4">
      <!-- Header and Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 class="text-xl sm:text-2xl font-bold text-blue-900 dark:text-white">Students</h1>
        <div class="flex gap-2">
          <!-- Mobile filter button -->
          <button
            class="inline-flex md:hidden items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            on:click={openFilterDrawer}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 009 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z"/>
            </svg>
            Filters
          </button>
          <!-- Desktop filters -->
          <div class="hidden md:flex gap-2">
            <select bind:value={selectedCourse} class="border rounded px-3 py-2 w-32 dark:bg-gray-900 dark:text-white">
              <option value="">All Courses</option>
              {#each courses as course}
                <option value={course}>{course}</option>
              {/each}
            </select>
            <select bind:value={selectedYear} class="border rounded px-3 py-2 w-32 dark:bg-gray-900 dark:text-white">
              <option value="">All Years</option>
              {#each years as year}
                <option value={year}>{year}</option>
              {/each}
            </select>
            <select bind:value={selectedSection} class="border rounded px-3 py-2 w-32 dark:bg-gray-900 dark:text-white">
              <option value="">All Sections</option>
              {#each sections as section}
                <option value={section}>{section}</option>
              {/each}
            </select>
            <button
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              on:click={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Drawer for mobile -->
      {#if filterDrawerOpen}
        <div class="fixed inset-0 z-50 flex md:hidden">
          <div class="fixed inset-0 bg-black/40" on:click={closeFilterDrawer}></div>
          <div class="relative z-50 w-72 bg-white dark:bg-gray-900 rounded-r-lg shadow-lg p-6"
            on:click|stopPropagation>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-blue-900 dark:text-white">Filters</h2>
              <button on:click={closeFilterDrawer} class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Course</label>
                <select bind:value={selectedCourse} class="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white">
                  <option value="">All Courses</option>
                  {#each courses as course}
                    <option value={course}>{course}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Year Level</label>
                <select bind:value={selectedYear} class="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white">
                  <option value="">All Years</option>
                  {#each years as year}
                    <option value={year}>{year}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Section</label>
                <select bind:value={selectedSection} class="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white">
                  <option value="">All Sections</option>
                  {#each sections as section}
                    <option value={section}>{section}</option>
                  {/each}
                </select>
              </div>
              <button
                class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                on:click={() => { resetFilters(); closeFilterDrawer(); }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Student Table Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-2 sm:p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <h2 class="text-base sm:text-lg font-semibold text-blue-900 dark:text-white">Student List</h2>
          <button class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs sm:text-sm">
            + Add Student
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm">
            <thead>
              <tr class="bg-gray-100 dark:bg-gray-800">
                <th class="py-2 px-2 border border-gray-300 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 uppercase">Name</th>
                <th class="py-2 px-2 border border-gray-300 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 uppercase">Course</th>
                <th class="py-2 px-2 border border-gray-300 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 uppercase">Year</th>
                <th class="py-2 px-2 border border-gray-300 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 uppercase">Section</th>
                <th class="py-2 px-2 border border-gray-300 dark:border-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {#if filteredStudents.length === 0}
                <tr>
                  <td colspan="5" class="py-8 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                    No students found.
                  </td>
                </tr>
              {:else}
                {#each filteredStudents as student, i}
                  <tr class="{i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-blue-100 dark:hover:bg-gray-700 transition">
                    <td class="py-2 px-2 border border-gray-300 dark:border-gray-700">{student.name}</td>
                    <td class="py-2 px-2 border border-gray-300 dark:border-gray-700">{student.course}</td>
                    <td class="py-2 px-2 border border-gray-300 dark:border-gray-700">{student.year}</td>
                    <td class="py-2 px-2 border border-gray-300 dark:border-gray-700">{student.section}</td>
                    <td class="py-2 px-2 border border-gray-300 dark:border-gray-700">
                      <button class="text-blue-600 hover:underline text-xs">View</button>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>

      <!-- More Sections -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h3 class="text-lg font-semibold mb-2 text-blue-900 dark:text-white">Recent Activities</h3>
          <ul class="text-gray-700 dark:text-gray-300 text-sm space-y-2">
            <li>• Alice Johnson enrolled in BSCS.</li>
            <li>• Bob Smith updated profile.</li>
            <li>• Carol Lee transferred to Section C.</li>
          </ul>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h3 class="text-lg font-semibold mb-2 text-blue-900 dark:text-white">Announcements</h3>
          <ul class="text-gray-700 dark:text-gray-300 text-sm space-y-2">
            <li>• Enrollment for 2nd semester starts next week.</li>
            <li>• Orientation for freshmen on Friday.</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</div>