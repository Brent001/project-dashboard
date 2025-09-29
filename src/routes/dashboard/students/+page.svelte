<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';

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
    showActions?: boolean;
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
    year: s.yearLevel ?? '',
    showActions: false
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

  // Toggle actions dropdown for a specific student
  function toggleActions(studentIndex: number, event: Event) {
    event.stopPropagation();
    // Close all other dropdowns first
    students.forEach((s, i) => {
      if (i !== studentIndex) {
        s.showActions = false;
      }
    });
    // Toggle the clicked one
    students[studentIndex].showActions = !students[studentIndex].showActions;
    students = students; // Trigger reactivity
  }

  // Close all dropdowns when clicking outside
  onMount(() => {
    const closeAll = () => {
      students.forEach(s => s.showActions = false);
      students = students; // Trigger reactivity
    };
    const handler = (e: Event) => {
      // Don't close if clicking on an action button or dropdown
      const target = e.target as HTMLElement;
      if (!target.closest('.actions-container')) {
        closeAll();
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  });

  // Action handlers
  function viewStudent(studNo: string) {
    window.location.href = `/dashboard/students/view?id=${studNo}`;
  }

  function editStudent(studNo: string) {
    window.location.href = `/dashboard/students/edit?id=${studNo}`;
  }

  function addGrade(studNo: string, name: string) {
    window.location.href = `/dashboard/students/add_grades?studNo=${studNo}&name=${encodeURIComponent(name)}`;
  }

  function deleteStudent(studNo: string, name: string) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      // Handle delete logic here
      console.log('Deleting student:', studNo);
    }
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
      <div class="fixed inset-0 bg-black opacity-40" role="button" tabindex="0" aria-label="Close sidebar overlay" on:click={closeSidebar} on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') closeSidebar(); }}></div>
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

    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Enhanced Header Section -->
        <div class="mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="space-y-2">
              <h1 class="text-3xl md:text-4xl font-bold text-blue-900 dark:text-white tracking-tight">
                Students
              </h1>
              <div class="flex items-center gap-4 text-sm">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  {filteredStudents.length} students
                </span>
                <span class="text-blue-600 dark:text-blue-400">
                  Manage your student database
                </span>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
              <a href="/dashboard/students/add-student" 
                 class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Student
              </a>
              
              <button
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                on:click={() => viewMode = viewMode === 'table' ? 'grid' : 'table'}
              >
                {#if viewMode === 'table'}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                  Grid View
                {:else}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  Table View
                {/if}
              </button>
            </div>
          </div>
        </div>

        <!-- Enhanced Search and Filter Section -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Enhanced Search Bar -->
            <div class="flex-1">
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Students
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or student ID..."
                  bind:value={searchQuery}
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
            
            <!-- Filter Button for Mobile -->
            <div class="md:hidden">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filters
              </label>
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                on:click={openFilterDrawer}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17a1 1 0 01-.293.707L9 20.414A1 1 0 018 20v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z"/>
                </svg>
                Open Filters
              </button>
            </div>
            
            <!-- Desktop Filters -->
            <div class="hidden md:flex flex-wrap gap-4 min-w-0">
              <div class="min-w-0 flex-1">
                <label for="course-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course
                </label>
                <div class="relative">
                  <select
                    id="course-filter"
                    bind:value={selectedCourse}
                    class="appearance-none w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 min-w-0"
                  >
                    <option value="">All Courses</option>
                    {#each courses as course}
                      <option value={course}>{course}</option>
                    {/each}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="min-w-0 flex-1">
                <label for="year-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year Level
                </label>
                <div class="relative">
                  <select
                    id="year-filter"
                    bind:value={selectedYear}
                    class="appearance-none w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 min-w-0"
                  >
                    <option value="">All Years</option>
                    {#each years as year}
                      <option value={year}>{year}</option>
                    {/each}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="min-w-0 flex-1">
                <label for="section-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section
                </label>
                <div class="relative">
                  <select
                    id="section-filter"
                    bind:value={selectedSection}
                    class="appearance-none w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 min-w-0"
                  >
                    <option value="">All Sections</option>
                    {#each sections as section}
                      <option value={section}>{section}</option>
                    {/each}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="flex items-end">
                <button
                  class="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  on:click={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Drawer for Mobile -->
        {#if filterDrawerOpen}
          <div class="fixed inset-0 z-50 md:hidden">
            <div class="fixed inset-0 bg-black/50" on:click={closeFilterDrawer}></div>
            <div class="fixed right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
                 transition:fly={{ x: 300, duration: 300 }}
                 on:click|stopPropagation>
              <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-semibold text-blue-900 dark:text-white">Filter Students</h2>
                  <button on:click={closeFilterDrawer} class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Course</label>
                    <select bind:value={selectedCourse} class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                      <option value="">All Courses</option>
                      {#each courses as course}
                        <option value={course}>{course}</option>
                      {/each}
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Year Level</label>
                    <select bind:value={selectedYear} class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                      <option value="">All Years</option>
                      {#each years as year}
                        <option value={year}>{year}</option>
                      {/each}
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Section</label>
                    <select bind:value={selectedSection} class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                      <option value="">All Sections</option>
                      {#each sections as section}
                        <option value={section}>{section}</option>
                      {/each}
                    </select>
                  </div>
                  <button
                    class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    on:click={() => { resetFilters(); closeFilterDrawer(); }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Enhanced Content Area -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {#if viewMode === 'table'}
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Course</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Year</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Section</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  {#if filteredStudents.length === 0}
                    <tr>
                      <td colspan="7" class="px-6 py-16 text-center">
                        <div class="flex flex-col items-center">
                          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                            </svg>
                          </div>
                          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
                          <p class="text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find students.</p>
                        </div>
                      </td>
                    </tr>
                  {:else}
                    {#each filteredStudents as student, index}
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              <span class="text-white font-semibold text-sm">
                                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</div>
                              <div class="text-sm text-gray-500 dark:text-gray-400">{student.gender || 'Not specified'}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            {student.studNo}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            {student.course}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">{student.year}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.section || '—'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.contactNumber || '—'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                          <div class="relative actions-container">
                            <button
                              class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none group"
                              on:click={(e) => toggleActions(index, e)}
                              aria-haspopup="true"
                              aria-expanded={student.showActions ? "true" : "false"}
                              title="More actions"
                            >
                              <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                              </svg>
                            </button>
                            
                            {#if student.showActions}
                              <div
                                class="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2 backdrop-blur-sm"
                                transition:fly={{ y: -10, duration: 200 }}
                              >
                                <button
                                  class="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg mx-2"
                                  on:click={() => viewStudent(student.studNo)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                  </svg>
                                  View Details
                                </button>
                                <button
                                  class="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg mx-2"
                                  on:click={() => editStudent(student.studNo)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                  Edit Student
                                </button>
                                <div class="border-t border-gray-200 dark:border-gray-600 my-2 mx-2"></div>
                                <button
                                  class="flex items-center w-full px-4 py-3 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors rounded-lg mx-2"
                                  on:click={() => addGrade(student.studNo, student.name)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                  </svg>
                                  Add Grade
                                </button>
                                <button
                                  class="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg mx-2"
                                  on:click={() => deleteStudent(student.studNo, student.name)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                  Delete Student
                                </button>
                              </div>
                            {/if}
                          </div>
                        </td>
                      </tr>
                    {/each}
                  {/if}
                </tbody>
              </table>
            </div>
          {:else}
            <!-- Enhanced Grid View -->
            <div class="p-8">
              {#if filteredStudents.length === 0}
                <div class="text-center py-16">
                  <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No students found</h3>
                  <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Try adjusting your search or filters to find students, or add new students to get started.</p>
                </div>
              {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {#each filteredStudents as student, index}
                    <div class="group bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 overflow-hidden">
                      <!-- Card Header -->
                      <div class="p-5 pb-0">
                        <div class="flex items-start justify-between mb-4">
                          <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                            <span class="text-white font-bold text-lg">
                              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                            </span>
                          </div>
                          
                          <!-- Action dropdown for grid -->
                          <div class="relative actions-container">
                            <button
                              class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none opacity-0 group-hover:opacity-100"
                              on:click={(e) => toggleActions(index, e)}
                              aria-haspopup="true"
                              aria-expanded={student.showActions ? "true" : "false"}
                              title="More actions"
                            >
                              <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                              </svg>
                            </button>
                            
                            {#if student.showActions}
                              <div
                                class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2"
                                transition:fly={{ y: -10, duration: 200 }}
                              >
                                <button
                                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  on:click={() => viewStudent(student.studNo)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                  </svg>
                                  View
                                </button>
                                <button
                                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  on:click={() => editStudent(student.studNo)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                  Edit
                                </button>
                                <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                                <button
                                  class="flex items-center w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                  on:click={() => addGrade(student.studNo, student.name)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                  </svg>
                                  Add Grade
                                </button>
                                <button
                                  class="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  on:click={() => deleteStudent(student.studNo, student.name)}
                                >
                                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            {/if}
                          </div>
                        </div>

                        <!-- Student Info -->
                        <div class="space-y-1 mb-4">
                          <h3 class="font-semibold text-gray-900 dark:text-white text-sm truncate">{student.name}</h3>
                          <p class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-md inline-block">{student.studNo}</p>
                        </div>
                      </div>

                      <!-- Card Body -->
                      <div class="px-5 pb-5">
                        <div class="space-y-3">
                          <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <span class="text-xs text-gray-600 dark:text-gray-300 font-medium">Course</span>
                            <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">{student.course}</span>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-3">
                            <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                              <span class="text-xs text-gray-600 dark:text-gray-300 font-medium">Year</span>
                              <span class="text-xs font-semibold text-gray-900 dark:text-white">{student.year}</span>
                            </div>
                            <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                              <span class="text-xs text-gray-600 dark:text-gray-300 font-medium">Section</span>
                              <span class="text-xs font-semibold text-gray-900 dark:text-white">{student.section || '—'}</span>
                            </div>
                          </div>

                          {#if student.contactNumber}
                            <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                              <span class="text-xs text-gray-600 dark:text-gray-300 font-medium">Contact</span>
                              <span class="text-xs font-semibold text-gray-900 dark:text-white">{student.contactNumber}</span>
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>