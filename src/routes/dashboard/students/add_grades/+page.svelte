<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // Staff info for sidebar/navbar
  let staffId = '';
  let staffName = '';
  let role = '';
  let pictureUrl = '';

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  // Student info
  let studNo = '';
  let studentName = '';
  let course = '';
  let yearLevel = '';
  let section = '';

  // Subject management
  let allSubjects: any[] = [];
  let enrolledSubjects: any[] = [];
  let availableSubjects: any[] = [];
  let selectedSubjectForEnrollment = '';
  let showEnrollmentModal = false;

  // Grade management for period-based entry
  type AcademicPeriod = 'prelim' | 'midterm' | 'semifinals' | 'finals';
  let activePeriod: AcademicPeriod = 'prelim';

  // Store grades by period and enrolled subject ID
  let gradesByPeriod: {
    [period in AcademicPeriod]: { [enrolledSubjectId: string]: number | null }
  } = {
    prelim: {},
    midterm: {},
    semifinals: {},
    finals: {}
  };

  // UI State
  let activeTab = 'enrollment'; // 'enrollment' or 'grades'
  let loading = false;
  let saving = false;
  let error = '';
  let success: string = '';

  // Academic periods configuration
  const academicPeriods: { id: AcademicPeriod; name: string; weight: number; color: string }[] = [
    { id: 'prelim', name: 'Prelim', weight: 0.2, color: 'blue' },
    { id: 'midterm', name: 'Midterm', weight: 0.2, color: 'green' },
    { id: 'semifinals', name: 'Semifinals', weight: 0.3, color: 'yellow' },
    { id: 'finals', name: 'Finals', weight: 0.3, color: 'red' }
  ];

  // Load data from query params
  onMount(async () => {
    const params = $page.url.searchParams;
    studNo = params.get('studNo') ?? '';

    if (studNo) {
      // Load all subjects first, then student data
      await loadAllSubjects();
      await loadStudentInfo();
      await loadStudentEnrollmentsAndGrades();
    }
  });

  async function loadStudentInfo() {
    try {
      const res = await fetch(`/api/students?studNo=${studNo}`);
      if (res.ok) {
        const students = await res.json();
        const student = students.find((s: any) => s.studNo === studNo);
        if (student) {
          studentName = `${student.firstName} ${student.lastName}`;
          course = student.course;
          yearLevel = student.yearLevel ?? '';
          section = student.section ?? '';
        }
      }
    } catch (e: unknown) {
      console.error('Failed to load student info:', e instanceof Error ? e.message : e);
    }
  }

  async function loadAllSubjects() {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        allSubjects = await res.json();
      }
    } catch (e) {
      console.error('Failed to load subjects:', e);
      error = 'Failed to load subjects. Please refresh the page.';
    }
  }

  // Load enrollments using the dedicated enrollments API
  async function loadStudentEnrollmentsAndGrades() {
    if (!studNo) return;

    loading = true;
    error = '';
    
    try {
      // Load enrollments from /api/enrollments
      const enrollmentRes = await fetch(`/api/enrollments?studNo=${studNo}`);
      if (enrollmentRes.ok) {
        enrolledSubjects = await enrollmentRes.json();
      } else {
        console.error('Failed to load enrollments');
        enrolledSubjects = [];
      }

      // Load grades from /api/students/add_grades
      const gradesRes = await fetch(`/api/students/add_grades?studNo=${studNo}`);
      if (gradesRes.ok) {
        const data = await gradesRes.json();
        const grades = data.grades ?? {};

        // Initialize gradesByPeriod for each enrolled subject
        academicPeriods.forEach((period) => {
          gradesByPeriod[period.id] = {};
          for (const subject of enrolledSubjects) {
            gradesByPeriod[period.id][subject.id] = grades[period.id] ?? null;
          }
        });
      }

      updateAvailableSubjects();
    } catch (e: unknown) {
      console.error('Failed to load enrollments/grades:', e instanceof Error ? e.message : e);
      error = 'Failed to load enrolled subjects or grades';
    }
    loading = false;
  }

  function updateAvailableSubjects() {
    const enrolledSubjectIds = enrolledSubjects.map(s => s.id);
    availableSubjects = allSubjects.filter(subject =>
      !enrolledSubjectIds.includes(subject.id)
    );
  }

  async function enrollInSubject() {
    if (!selectedSubjectForEnrollment) {
      error = 'Please select a subject to enroll';
      return;
    }

    saving = true;
    error = '';
    success = '';

    try {
      // Use the enrollments API for consistency
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studNo,
          subjectId: selectedSubjectForEnrollment
        })
      });

      const data = await res.json();

      if (res.ok) {
        success = 'Student enrolled successfully!';
        
        // Reload data to get updated enrollments
        await loadStudentEnrollmentsAndGrades();
        
        // Reset form
        selectedSubjectForEnrollment = '';
        showEnrollmentModal = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => success = '', 3000);
      } else {
        error = data.error || 'Failed to enroll student';
      }
    } catch (e) {
      console.error('Enrollment error:', e);
      error = 'Network error while enrolling student';
    }
    saving = false;
  }

  async function unenrollFromSubject(subjectId: string) {
    if (!confirm('Are you sure you want to unenroll from this subject? This will also delete all grades.')) {
      return;
    }

    saving = true;
    error = '';
    success = '';

    try {
      const res = await fetch('/api/enrollments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studNo,
          subjectId
        })
      });

      if (res.ok) {
        success = 'Student unenrolled successfully!';
        
        // Reload data to get updated enrollments
        await loadStudentEnrollmentsAndGrades();

        // Clear grades for this subject in UI
        academicPeriods.forEach(period => {
          delete gradesByPeriod[period.id][subjectId];
        });

        setTimeout(() => success = '', 3000);
      } else {
        const data = await res.json();
        error = data.error || 'Failed to unenroll student';
      }
    } catch (e) {
      console.error('Unenrollment error:', e);
      error = 'Network error while unenrolling student';
    }
    saving = false;
  }

  // Save grades for all subjects in the selected period
  async function savePeriodGrades(period: AcademicPeriod) {
    saving = true;
    error = '';
    success = '';

    try {
      // Check if there are any grades to save for this period
      const hasGrades = Object.values(gradesByPeriod[period]).some(grade => 
        grade !== null && grade !== undefined && grade > 0
      );

      if (!hasGrades) {
        error = `No valid grades entered for ${period}`;
        saving = false;
        return;
      }

      // Get the first enrolled subject ID (required by API)
      const firstSubjectId = enrolledSubjects[0]?.id;
      if (!firstSubjectId) {
        error = 'No enrolled subjects found';
        saving = false;
        return;
      }

      // Get the grade value (assuming single grade per period across all subjects)
      const gradeValue = Object.values(gradesByPeriod[period]).find(v => 
        v !== null && v !== undefined && v > 0
      );

      if (gradeValue !== null && gradeValue !== undefined && gradeValue > 0) {
        const gradeData = {
          studNo,
          subjectId: firstSubjectId,
          [period]: gradeValue
        };

        const res = await fetch('/api/students/add_grades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gradeData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to save grade');
        }

        success = `Grades for ${period} saved successfully!`;
        setTimeout(() => success = '', 3000);
        await loadStudentEnrollmentsAndGrades();
      }
    } catch (e) {
      console.error('Grade save error:', e);
      error = `Failed to save ${period} grades: ${e.message}`;
    }

    saving = false;
  }

  function generateGradeSummary(period: AcademicPeriod): string {
    const gradePairs: string[] = [];
    enrolledSubjects.forEach(subject => {
      const grade = gradesByPeriod[period][subject.id];
      if (grade !== null && grade !== undefined && grade > 0) {
        gradePairs.push(`${subject.code}: ${grade}`);
      }
    });
    return gradePairs.join('; ');
  }

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function toggleSidebarCollapsed() {
    sidebarCollapsed = !sidebarCollapsed;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  function getGradeColor(grade: number | null) {
    if (grade === null) return 'text-gray-400';
    if (grade >= 90) return 'text-green-600';
    if (grade >= 85) return 'text-blue-600';
    if (grade >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }

  function goBack() {
    goto('/dashboard/students');
  }

  function calculateFinalGrade(enrolledSubjectId: string): { finalGrade: number | null; remarks: string } {
    let totalWeightedGrade = 0;
    let totalWeight = 0;

    academicPeriods.forEach(period => {
      const grade = gradesByPeriod[period.id][enrolledSubjectId];
      if (grade !== null && grade > 0) {
        totalWeightedGrade += grade * period.weight;
        totalWeight += period.weight;
      }
    });

    if (totalWeight > 0) {
      const finalGrade = Math.round((totalWeightedGrade / totalWeight) * 100) / 100;
      const remarks = finalGrade >= 75 ? 'PASSED' : 'FAILED';
      return { finalGrade, remarks };
    }

    return { finalGrade: null, remarks: '' };
  }

  // Clear error messages when switching tabs
  $: if (activeTab) {
    error = '';
    success = '';
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
  <!-- Sidebar -->
  <div class="hidden md:block" class:w-20={sidebarCollapsed} class:w-64={!sidebarCollapsed}>
    <Sidebar 
      {staffId} 
      {staffName} 
      {role} 
      {sidebarCollapsed}
      {closeSidebar}
      {pictureUrl}
    />
  </div>

  <!-- Mobile Sidebar Overlay -->
  {#if sidebarOpen}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" on:click={closeSidebar}></div>
    <div class="fixed left-0 top-0 h-full w-64 z-50 md:hidden">
      <Sidebar 
        {staffId} 
        {staffName} 
        {role} 
        sidebarCollapsed={false}
        {closeSidebar}
        {pictureUrl}
      />
    </div>
  {/if}

  <!-- Main Content -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Navbar -->
    <Navbar 
      {staffId} 
      {staffName} 
      {role} 
      {sidebarOpen}
      {toggleSidebar}
      {sidebarCollapsed}
      {toggleSidebarCollapsed}
      {pictureUrl}
    />

    <!-- Page Content -->
    <div class="flex-1 overflow-auto">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <button 
                class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                on:click={goBack}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Student Information System</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">Subject enrollment and grade management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Student Info Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{studentName}</h2>
              <p class="text-gray-600 dark:text-gray-400">Student No: {studNo}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Course: {course}</span>
                <span>Year: {yearLevel}</span>
                <span>Section: {section}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500 dark:text-gray-400">Enrolled Subjects</div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{enrolledSubjects.length}</div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-8">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex space-x-8">
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm {
                  activeTab === 'enrollment'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }"
                on:click={() => activeTab = 'enrollment'}
              >
                Subject Enrollment
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm {
                  activeTab === 'grades'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }"
                on:click={() => activeTab = 'grades'}
              >
                Grade Management
              </button>
            </nav>
          </div>
        </div>

        <!-- Messages -->
        {#if error}
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-red-700 dark:text-red-400">{error}</span>
          </div>
        {/if}

        {#if success}
          <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-green-700 dark:text-green-400">{success}</span>
          </div>
        {/if}

        <!-- Tab Content -->
        {#if activeTab === 'enrollment'}
          <!-- Subject Enrollment Tab -->
          <div class="space-y-6">
            <!-- Add Subject Button -->
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Enrolled Subjects</h3>
              <button
                on:click={() => {
                  if (availableSubjects.length === 0) {
                    error = 'No available subjects to enroll in';
                    return;
                  }
                  showEnrollmentModal = true;
                  error = '';
                }}
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || availableSubjects.length === 0}
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Enroll in Subject
              </button>
            </div>

            <!-- Enrolled Subjects List -->
            {#if loading}
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            {:else if enrolledSubjects.length === 0}
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Enrolled Subjects</h3>
                <p class="text-gray-500 dark:text-gray-400">Click "Enroll in Subject" to add subjects for this student.</p>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each enrolledSubjects as subject}
                  {@const finalGradeData = calculateFinalGrade(subject.id)}
                  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div class="flex justify-between items-start mb-4">
                      <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{subject.code}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{subject.name}</p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{subject.units} units</span>
                        </div>
                      </div>
                      <button
                        on:click={() => unenrollFromSubject(subject.id)}
                        disabled={saving}
                        class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                        title="Unenroll from subject"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                    
                    {#if finalGradeData.finalGrade}
                      <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="text-center">
                          <div class="text-sm text-gray-600 dark:text-gray-400">Final Grade</div>
                          <div class="text-xl font-bold {getGradeColor(finalGradeData.finalGrade)}">
                            {finalGradeData.finalGrade}
                          </div>
                          <div class="text-xs font-semibold {(finalGradeData.finalGrade ?? 0) >= 75 ? 'text-green-600' : 'text-red-600'}">
                            {finalGradeData.remarks}
                          </div>
                        </div>
                      </div>
                    {:else}
                      <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <div class="text-sm text-gray-500 dark:text-gray-400">No grades entered</div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Enrollment Modal -->
            {#if showEnrollmentModal}
              <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                  <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Enroll in Subject</h3>
                      <button
                        on:click={() => {
                          showEnrollmentModal = false;
                          selectedSubjectForEnrollment = '';
                          error = '';
                        }}
                        class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Subject
                      </label>
                      <select
                        bind:value={selectedSubjectForEnrollment}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      >
                        <option value="">Select a subject...</option>
                        {#each availableSubjects as subject}
                          <option value={subject.id}>
                            {subject.code} - {subject.name} ({subject.units} units)
                          </option>
                        {/each}
                      </select>
                      {#if availableSubjects.length === 0}
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          No available subjects to enroll in.
                        </p>
                      {/if}
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                      <button
                        on:click={() => {
                          showEnrollmentModal = false;
                          selectedSubjectForEnrollment = '';
                          error = '';
                        }}
                        disabled={saving}
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        on:click={enrollInSubject}
                        disabled={!selectedSubjectForEnrollment || saving}
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {#if saving}
                          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        {/if}
                        <span>Enroll</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        
        {:else if activeTab === 'grades'}
          <!-- Grade Management Tab -->
          <div class="space-y-6">
            <!-- Period Selection -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Academic Period</h3>
              <div class="flex flex-wrap gap-3">
                {#each academicPeriods as period}
                  <button
                    class="px-4 py-2 rounded-lg font-semibold transition-colors {
                      activePeriod === period.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }"
                    on:click={() => activePeriod = period.id}
                  >
                    {period.name} ({Math.round((period.weight ?? 0) * 100)}%)
                  </button>
                {/each}
              </div>
            </div>

            <!-- Grade Entry Section -->
            {#if enrolledSubjects.length === 0}
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Enrolled Subjects</h3>
                <p class="text-gray-500 dark:text-gray-400">Please enroll in subjects first before adding grades.</p>
              </div>
            {:else}
              <!-- Grade Entry Form -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between mb-6">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Enter {activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Grades
                  </h4>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Weight: {Math.round((academicPeriods.find(p => p.id === activePeriod)?.weight ?? 0) * 100)}%
                  </div>
                </div>

                <!-- Grade Input Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {#each enrolledSubjects as subject}
                    <div class="space-y-3">
                      <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div class="font-semibold text-gray-900 dark:text-white">{subject.code}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{subject.name}</div>
                        </div>
                      </div>
                      
                      <div class="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          bind:value={gradesByPeriod[activePeriod][subject.id]}
                          placeholder="Enter grade (0-100)"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {#if gradesByPeriod[activePeriod][subject.id] !== null && gradesByPeriod[activePeriod][subject.id] > 0}
                          <div class="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>

                <!-- Grade Summary Display -->
                {#if generateGradeSummary(activePeriod)}
                  <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div class="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                      {activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Grade Summary:
                    </div>
                    <div class="font-mono text-sm text-blue-800 dark:text-blue-200 bg-white dark:bg-gray-800 p-2 rounded border">
                      {generateGradeSummary(activePeriod)}
                    </div>
                  </div>
                {/if}

                <!-- Save Button -->
                <div class="flex justify-end">
                  <button
                    on:click={() => savePeriodGrades(activePeriod)}
                    disabled={saving || !generateGradeSummary(activePeriod)}
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {#if saving}
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    {/if}
                    <span>Save {activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Grades</span>
                  </button>
                </div>
              </div>

              <!-- Grade Overview Table -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Grade Overview</h4>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Subject
                        </th>
                        {#each academicPeriods as period}
                          <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {period.name}
                          </th>
                        {/each}
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Final Grade
                        </th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {#each enrolledSubjects as subject}
                        {@const finalGradeData = calculateFinalGrade(subject.id)}
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div class="text-sm font-medium text-gray-900 dark:text-white">{subject.code}</div>
                              <div class="text-sm text-gray-500 dark:text-gray-400">{subject.name}</div>
                            </div>
                          </td>
                          {#each academicPeriods as period}
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                              <span class="text-sm font-semibold {getGradeColor(gradesByPeriod[period.id][subject.id])}">
                                {gradesByPeriod[period.id][subject.id] || '—'}
                              </span>
                            </td>
                          {/each}
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class="text-lg font-bold {getGradeColor(finalGradeData.finalGrade)}">
                              {finalGradeData.finalGrade || '—'}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            {#if finalGradeData.remarks}
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                                finalGradeData.remarks === 'PASSED' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }">
                                {finalGradeData.remarks}
                              </span>
                            {:else}
                              <span class="text-gray-400">—</span>
                            {/if}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>