<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import AcademicModal from '$lib/component/Academic_modal.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // Staff info for sidebar/navbar
  let staffId = '';
  let staffName = '';
  let role: string = '';
  let pictureUrl = '';

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  // Student info
  let studNo = '';
  let studentName = '';
  let course = '';
  let yearLevel = '';
  let section = '';
  let academicTermId = '';

  // Subject and grade data
  let allSubjects: any[] = [];
  let gradeRows: GradeRow[] = [];
  let loading = false;
  let saving = false;
  let error = '';
  let success = '';

  // Academic terms data
  let academicTerms: any[] = [];
  let selectedAcademicTermId = '';

  // Term modal
  let showTermModal = false;
  let newTerm = {
    name: '',
    startDate: '',
    endDate: '',
    isActive: false
  };
  let termModalError = '';
  let termModalSaving = false;

  // Academic modal
  let showAcademicModal = false;

  // Grade row interface
  interface GradeRow {
    id: string;
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    units: number;
    prelim: number | null;
    midterm: number | null;
    semifinals: number | null;
    finals: number | null;
    combined: number | null;
    remarks: string;
    isNew?: boolean;
    [key: string]: string | number | null | boolean | undefined;
  }

  // Academic periods for headers
  const academicPeriods = [
    { id: 'prelim', name: 'Prelim', weight: 0.2 },
    { id: 'midterm', name: 'Midterm', weight: 0.2 },
    { id: 'semifinals', name: 'Semifinals', weight: 0.3 },
    { id: 'finals', name: 'Finals', weight: 0.3 }
  ];

  onMount(async () => {
    const params = $page.url.searchParams;
    studNo = params.get('studNo') ?? '';
    studentName = params.get('name') ?? '';

    await loadAcademicTerms();

    // Set default academic term
    if (academicTerms.length > 0) {
      selectedAcademicTermId = academicTerms.find(t => t.isActive)?.id ?? academicTerms[0].id;
      academicTermId = selectedAcademicTermId;
    }

    if (studNo) {
      await Promise.all([
        loadAllSubjects(),
        loadStudentInfo()
      ]);
      await loadStudentGrades();
      addEmptyRow();
    }
  });

  async function loadAcademicTerms() {
    try {
      const res = await fetch('/api/academic-terms/active');
      if (res.ok) {
        academicTerms = await res.json();
      }
    } catch (e) {
      error = 'Failed to load academic terms.';
    }
  }

  function onAcademicTermChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedAcademicTermId = target.value;
    academicTermId = selectedAcademicTermId;
    loadStudentGrades();
  }

  async function loadStudentInfo() {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const students = await res.json();
        const student = students.find((s: any) => s.studNo === studNo);
          
        if (student) {
          studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
          course = student.course || '';
          yearLevel = student.yearLevel || '';
          section = student.section || '';
        }
      }
    } catch (e) {
      console.error('Failed to load student info:', e);
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

  async function loadStudentGrades() {
    if (!studNo || !academicTermId) return;

    loading = true;
    error = '';

    try {
      const res = await fetch(`/api/students/add_grades?studNo=${studNo}&academicTermId=${academicTermId}`);
      if (res.ok) {
        const enrollments = await res.json();

        gradeRows = enrollments.map((enrollment: any) => ({
          id: enrollment.enrollmentId,
          subjectId: enrollment.subjectId,
          subjectCode: enrollment.subjectCode || '',
          subjectName: enrollment.subjectName || '',
          units: enrollment.units || 0,
          prelim: enrollment.prelim ?? null,
          midterm: enrollment.midterm ?? null,
          semifinals: enrollment.semifinals ?? null,
          finals: enrollment.finals ?? null,
          combined: enrollment.combined ?? null,
          remarks: enrollment.remarks ?? '',
          isNew: false
        }));

        addEmptyRow();
      } else {
        const errorData = await res.json();
        error = errorData.error || 'Failed to load student grades';
      }
    } catch (e) {
      console.error('Failed to load grades:', e);
      error = 'Failed to load student grades';
    }
    loading = false;
  }

  function addEmptyRow() {
    const newRow: GradeRow = {
      id: `new_${Date.now()}`,
      subjectId: '',
      subjectCode: '',
      subjectName: '',
      units: 0,
      prelim: null,
      midterm: null,
      semifinals: null,
      finals: null,
      combined: null,
      remarks: '',
      isNew: true
    };
    gradeRows = [...gradeRows, newRow];
  }

  function onSubjectChange(rowIndex: number, subjectId: string) {
    if (!subjectId) return;
    
    const subject = allSubjects.find(s => s.id === subjectId);
    if (subject) {
      gradeRows[rowIndex] = {
        ...gradeRows[rowIndex],
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        units: subject.units
      };

      if (gradeRows[rowIndex].isNew) {
        enrollStudentInSubject(subjectId, rowIndex);
      }
    }
  }

  async function enrollStudentInSubject(subjectId: string, rowIndex: number) {
    try {
      const res = await fetch('/api/students/add_grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studNo,
          subjectId,
          academicTermId
        })
      });

      if (res.ok) {
        const result = await res.json();
        // Update the row with the new enrollment ID
        gradeRows[rowIndex] = {
          ...gradeRows[rowIndex],
          id: result.gradeSubjectId,
          isNew: false
        };
        // Add a new empty row for next enrollment
        addEmptyRow();
        success = 'Student enrolled in subject successfully!';
        setTimeout(() => success = '', 3000);
      } else {
        const data = await res.json();
        error = data.error || 'Failed to enroll student';
        gradeRows[rowIndex] = {
          ...gradeRows[rowIndex],
          subjectId: '',
          subjectCode: '',
          subjectName: '',
          units: 0
        };
      }
    } catch (e) {
      console.error('Enrollment error:', e);
      error = 'Network error while enrolling student';
    }
  }

  async function saveGrade(rowIndex: number, period: string, value: number | null) {
    if (gradeRows[rowIndex].isNew || !gradeRows[rowIndex].subjectId) return;
    if (value === null || value <= 0) return;

    const originalValue = gradeRows[rowIndex][period as keyof GradeRow];
    
    try {
      const gradeData = {
        studNo,
        academicTermId,
        subjectId: gradeRows[rowIndex].subjectId,
        [period]: value
      };

      const res = await fetch('/api/students/add_grades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });

      if (res.ok) {
        const result = await res.json();
        if (result.updatedGrade) {
          gradeRows[rowIndex] = {
            ...gradeRows[rowIndex],
            prelim: result.updatedGrade.prelim,
            midterm: result.updatedGrade.midterm,
            semifinals: result.updatedGrade.semifinals,
            finals: result.updatedGrade.finals,
            combined: result.updatedGrade.combined,
            remarks: result.updatedGrade.remarks
          };
        }
        success = `Grade saved successfully!`;
        setTimeout(() => success = '', 2000);
      } else {
        const errorData = await res.json();
        error = errorData.error || 'Failed to save grade';
        (gradeRows[rowIndex][period as keyof GradeRow] as any) = originalValue;
      }
    } catch (e) {
      console.error('Grade save error:', e);
      error = 'Failed to save grade';
      (gradeRows[rowIndex][period as keyof GradeRow] as any) = originalValue;
    }
  }

  async function deleteRow(rowIndex: number) {
    const row = gradeRows[rowIndex];
    if (row.isNew) {
      gradeRows = gradeRows.filter((_, i) => i !== rowIndex);
      return;
    }

    if (!confirm('Are you sure you want to remove this subject enrollment? This will delete all grades.')) {
      return;
    }

    try {
      const res = await fetch('/api/students/add_grades', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: row.id
        })
      });

      if (res.ok) {
        gradeRows = gradeRows.filter((_, i) => i !== rowIndex);
        success = 'Subject enrollment removed successfully!';
        setTimeout(() => success = '', 3000);
      } else {
        const data = await res.json();
        error = data.error || 'Failed to remove enrollment';
      }
    } catch (e) {
      console.error('Delete error:', e);
      error = 'Network error while removing enrollment';
    }
  }

  function calculateFinalGrade(row: GradeRow): { finalGrade: number | null; remarks: string } {
    if (row.combined && row.combined > 0) {
      return { 
        finalGrade: row.combined, 
        remarks: row.remarks || (row.combined >= 75 ? 'PASSED' : 'FAILED')
      };
    }

    let totalWeightedGrade = 0;
    let totalWeight = 0;

    academicPeriods.forEach(period => {
      const grade = row[period.id as keyof GradeRow] as number;
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

  function getGradeColor(grade: number | null) {
    if (grade === null || grade === 0) return 'text-gray-400';
    if (grade >= 90) return 'text-green-600';
    if (grade >= 85) return 'text-blue-600';
    if (grade >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getAvailableSubjects(currentRowIndex: number) {
    const usedSubjectIds = gradeRows
      .filter((_, index) => index !== currentRowIndex && !gradeRows[index].isNew)
      .map(row => row.subjectId);
    
    return allSubjects.filter(subject => !usedSubjectIds.includes(subject.id));
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

  function goBack() {
    goto('/dashboard/students');
  }

  function handleAcademicModalSuccess(newTerm) {
    showAcademicModal = false;
    loadAcademicTerms();
  }

  function handleAcademicModalClose() {
    showAcademicModal = false;
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
    <div class="fixed inset-0 z-40 flex md:hidden">
      <div
        class="fixed inset-0 bg-black opacity-40 cursor-pointer"
        aria-label="Close sidebar overlay"
        on:click={closeSidebar}
        on:keydown={(e) => handleKeyDown(e, closeSidebar)}
      ></div>
      <div
        class="relative z-50 w-64 h-full bg-white dark:bg-gray-900 transition-all duration-300"
        transition:fly={{ x: -300, duration: 300 }}
        on:click|stopPropagation
      >
        <Sidebar 
          {staffId} 
          {staffName} 
          {role} 
          sidebarCollapsed={false}
          {closeSidebar}
          {pictureUrl}
        />
      </div>
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
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Student Info Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{studentName || 'Loading...'}</h2>
              <p class="text-gray-600 dark:text-gray-400">Student No: {studNo}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Course: {course || 'N/A'}</span>
                <span>Year: {yearLevel || 'N/A'}</span>
                <span>Section: {section || 'N/A'}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500 dark:text-gray-400">Enrolled Subjects</div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradeRows.filter(row => !row.isNew).length}
              </div>
            </div>
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

        <!-- Academic Term Dropdown -->
        <div class="mb-6 flex items-center space-x-3">
          <label for="academic-term" class="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Term:</label>
          <select
            id="academic-term"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            bind:value={selectedAcademicTermId}
            on:change={(e) => {
              if (e.target.value === '__add__') {
                showAcademicModal = true;
                // Reset selection to previous value
                selectedAcademicTermId = academicTermId;
              } else {
                onAcademicTermChange(e);
              }
            }}
          >
            {#each academicTerms as term}
              <option value={term.id}>
                {term.name} ({term.startDate} - {term.endDate}) {term.isActive ? '[Active]' : ''}
              </option>
            {/each}
            <option value="__add__">➕ Add Academic Term...</option>
          </select>
        </div>

        <!-- Academic Term Modal -->
        <AcademicModal
          isOpen={showAcademicModal}
          on:success={e => handleAcademicModalSuccess(e.detail)}
          on:close={handleAcademicModalClose}
        />

        <!-- Excel-style Grade Table -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Subject Grades</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Select subjects and enter grades directly in the table</p>
          </div>
          
          {#if loading}
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600" style="min-width: 250px;">
                      Subject
                    </th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600" style="min-width: 80px;">
                      Units
                    </th>
                    {#each academicPeriods as period}
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600" style="min-width: 100px;">
                        {period.name}<br>
                        <span class="font-normal">({Math.round(period.weight * 100)}%)</span>
                      </th>
                    {/each}
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600" style="min-width: 100px;">
                      Final Grade
                    </th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600" style="min-width: 100px;">
                      Remarks
                    </th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style="min-width: 80px;">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {#each gradeRows as row, rowIndex}
                    {@const finalGradeData = calculateFinalGrade(row)}
                    {@const availableSubjects = getAvailableSubjects(rowIndex)}
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 {row.isNew ? 'bg-blue-50 dark:bg-blue-900/10' : ''}">
                      <!-- Subject Selection -->
                      <td class="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                        {#if row.isNew}
                          <select
                            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={row.subjectId}
                            on:change={(e) => {
                              const target = e.target as HTMLSelectElement | null;
                              if (target) onSubjectChange(rowIndex, target.value);
                            }}
                          >
                            <option value="">Select a subject...</option>
                            {#each availableSubjects as subject}
                              <option value={subject.id}>
                                {subject.code} - {subject.name}
                              </option>
                            {/each}
                          </select>
                        {:else}
                          <div class="text-sm">
                            <div class="font-medium text-gray-900 dark:text-white">{row.subjectCode}</div>
                            <div class="text-gray-500 dark:text-gray-400">{row.subjectName}</div>
                          </div>
                        {/if}
                      </td>

                      <!-- Units -->
                      <td class="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-600">
                        <span class="text-sm text-gray-900 dark:text-white">
                          {row.units || '—'}
                        </span>
                      </td>

                      <!-- Grade Columns -->
                      {#each academicPeriods as period}
                        <td class="px-2 py-3 border-r border-gray-200 dark:border-gray-600">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={row[period.id] && row[period.id] !== 0 ? row[period.id] : ''}
                            placeholder="—"
                            disabled={row.isNew || !row.subjectId}
                            class="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed {getGradeColor(row[period.id])}"
                            on:input={(e) => {
                              const target = e.target as HTMLInputElement | null;
                              if (target) {
                                const value = parseFloat(target.value);
                                row[period.id as keyof GradeRow] = isNaN(value) ? null : value;
                              }
                            }}
                            on:blur={(e) => {
                              const target = e.target as HTMLInputElement | null;
                              if (target) {
                                const value = parseFloat(target.value);
                                if (!isNaN(value) && value > 0) {
                                  saveGrade(rowIndex, period.id, value);
                                }
                              }
                            }}
                          />
                        </td>
                      {/each}

                      <!-- Final Grade -->
                      <td class="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-600">
                        <span class="text-sm font-bold {getGradeColor(finalGradeData.finalGrade)}">
                          {finalGradeData.finalGrade || '—'}
                        </span>
                      </td>

                      <!-- Remarks -->
                      <td class="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-600">
                        {#if finalGradeData.remarks}
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {
                            finalGradeData.remarks === 'PASSED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }">
                            {finalGradeData.remarks}
                          </span>
                        {:else}
                          <span class="text-gray-400 text-sm">—</span>
                        {/if}
                      </td>

                      <!-- Actions -->
                      <td class="px-4 py-3 text-center">
                        <button
                          on:click={() => deleteRow(rowIndex)}
                          class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title={row.isNew ? 'Remove row' : 'Remove enrollment'}
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  {/each}

                  <!-- Empty state -->
                  {#if gradeRows.length === 0}
                    <tr>
                      <td colspan="9" class="px-6 py-12 text-center">
                        <div class="text-gray-500 dark:text-gray-400">
                          No subjects enrolled. Add subjects using the dropdown above.
                        </div>
                      </td>
                    </tr>
                  {/if}
                </tbody>
              </table>
            </div>
          {/if}
        </div>

        <!-- Instructions -->
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-blue-700 dark:text-blue-300">
              <strong>How to use:</strong>
              <ul class="mt-2 space-y-1 list-disc list-inside">
                <li>Select a subject from the dropdown to enroll the student</li>
                <li>Enter grades directly in the period columns (values auto-save on blur)</li>
                <li>Final grades are automatically calculated based on period weights</li>
                <li>Use the delete button to remove subject enrollments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>