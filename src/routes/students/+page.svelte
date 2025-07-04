<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { fly } from 'svelte/transition';

  export let data;

  type Student = {
    studNo: string;
    firstName: string;
    lastName: string;
    gender?: string;
    age?: number;
    birthDate?: string;
    address?: string;
    contactNumber?: string;
    pictureId?: string;
    course: string;
    section?: string;
    guardian?: string;
    guardianPhone?: string;
    mother?: string;
    father?: string;
    yearLevel?: string;
    name?: string;
    year?: string;
  };

  let { staffId, staffName, role, pictureUrl, students } = data as {
    staffId: string;
    staffName: string;
    role: string;
    pictureUrl: string;
    students: Student[];
  };
  
  let sidebarOpen = false;
  let sidebarCollapsed = true;
  let filterDrawerOpen = false;
  let searchQuery = '';
  let viewMode = 'table'; // 'table' or 'grid'

  // Filter state
  let selectedCourse = '';
  let selectedYear = '';
  let selectedSection = '';

  // Use students from server data and add computed fields for display
  students = (students ?? []).map((s) => ({
    ...s,
    name: `${s.firstName} ${s.lastName}`,
    year: s.yearLevel ?? ''
  }));

  // Generate filter options from students data
  let courses = Array.from(new Set(students.map((s) => s.course))).filter(Boolean);
  let years = Array.from(new Set(students.map((s) => s.yearLevel ?? s.year))).filter(Boolean);
  let sections = Array.from(new Set(students.map((s) => s.section))).filter(Boolean);

  $: filteredStudents = students.filter((s: Student) => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.studNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = !selectedCourse || s.course === selectedCourse;
    const matchesYear = !selectedYear || (s.yearLevel ?? s.year) === selectedYear;
    const matchesSection = !selectedSection || s.section === selectedSection;
    
    return matchesSearch && matchesCourse && matchesYear && matchesSection;
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
    selectedCourse = '';
    selectedYear = '';
    selectedSection = '';
    searchQuery = '';
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
          <h1 class="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white">Students</h1>
          <p class="text-blue-600 dark:text-blue-400 mt-1">{filteredStudents.length} students found</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a href="/students/add-student" 
             class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Student
          </a>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            on:click={() => viewMode = viewMode === 'table' ? 'grid' : 'table'}
          >
            {#if viewMode === 'table'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              Grid View
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Table View
            {/if}
          </button>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Bar -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search students by name or ID..."
              bind:value={searchQuery}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <!-- Filter Button for Mobile -->
          <button
            class="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            on:click={openFilterDrawer}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17a1 1 0 01-.293.707L9 20.414A1 1 0 018 20v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z"/>
            </svg>
            Filters
          </button>
          
          <!-- Desktop Filters -->
          <div class="hidden md:flex gap-3">
            <select bind:value={selectedCourse} class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="">All Courses</option>
              {#each courses as course}
                <option value={course}>{course}</option>
              {/each}
            </select>
            <select bind:value={selectedYear} class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="">All Years</option>
              {#each years as year}
                <option value={year}>{year}</option>
              {/each}
            </select>
            <select bind:value={selectedSection} class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="">All Sections</option>
              {#each sections as section}
                <option value={section}>{section}</option>
              {/each}
            </select>
            <button
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              on:click={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Drawer for Mobile -->
      {#if filterDrawerOpen}
        <div class="fixed inset-0 z-50 md:hidden">
          <div class="fixed inset-0 bg-black/50" on:click={closeFilterDrawer}></div>
          <div class="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto"
               transition:fly={{ x: 300, duration: 300 }}
               on:click|stopPropagation>
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-blue-900 dark:text-white">Filters</h2>
              <button on:click={closeFilterDrawer} class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
                <select bind:value={selectedCourse} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">All Courses</option>
                  {#each courses as course}
                    <option value={course}>{course}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year Level</label>
                <select bind:value={selectedYear} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">All Years</option>
                  {#each years as year}
                    <option value={year}>{year}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section</label>
                <select bind:value={selectedSection} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">All Sections</option>
                  {#each sections as section}
                    <option value={section}>{section}</option>
                  {/each}
                </select>
              </div>
              <button
                class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                on:click={() => { resetFilters(); closeFilterDrawer(); }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Content Area -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {#if viewMode === 'table'}
          <!-- Table View -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Section</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {#if filteredStudents.length === 0}
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div class="flex flex-col items-center">
                        <svg class="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                        </svg>
                        <p class="text-lg font-medium">No students found</p>
                        <p class="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                {:else}
                  {#each filteredStudents as student}
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span class="text-blue-600 dark:text-blue-400 font-medium">
                              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">{student.contactNumber || 'No contact'}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.studNo}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {student.course}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.year}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.section || 'N/A'}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex items-center gap-2">
                          <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            View
                          </button>
                          <button class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
        {:else}
          <!-- Grid View -->
          <div class="p-6">
            {#if filteredStudents.length === 0}
              <div class="text-center py-12">
                <svg class="w-12 h-12 mb-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
                <p class="text-lg font-medium text-gray-500 dark:text-gray-400">No students found</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {#each filteredStudents as student}
                  <div class="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                      <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span class="text-blue-600 dark:text-blue-400 font-medium text-lg">
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white">{student.name}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{student.studNo}</p>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Course:</span>
                        <span class="text-xs font-medium text-gray-900 dark:text-white">{student.course}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Year:</span>
                        <span class="text-xs font-medium text-gray-900 dark:text-white">{student.year}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Section:</span>
                        <span class="text-xs font-medium text-gray-900 dark:text-white">{student.section || 'N/A'}</span>
                      </div>
                    </div>
                    <div class="mt-4 flex gap-2">
                      <button class="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        View
                      </button>
                      <button class="flex-1 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Stats and Activity Section -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-white mb-4">Quick Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Total Students</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{students.length}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Active Courses</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{courses.length}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Year Levels</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{years.length}</span>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-white mb-4">Recent Activities</h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p class="text-sm text-gray-900 dark:text-white">Alice Johnson enrolled in BSCS</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p class="text-sm text-gray-900 dark:text-white">Bob Smith updated profile</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p class="text-sm text-gray-900 dark:text-white">Carol Lee transferred to Section C</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Announcements -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-white mb-4">Announcements</h3>
          <div class="space-y-3">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p class="text-sm text-gray-900 dark:text-white">Enrollment for 2nd semester starts next week</p>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">Important</p>
            </div>
            <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p class="text-sm text-gray-900 dark:text-white">Orientation for freshmen on Friday</p>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">Event</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>