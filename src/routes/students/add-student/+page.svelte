<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import BasicInfoForm from '$lib/component/add_student/BasicInfoForm.svelte';
  import PersonalInfoForm from '$lib/component/add_student/PersonalInfoForm.svelte';
  import FamilyInfoForm from '$lib/component/add_student/FamilyInfoForm.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let data: {
    staffId: string;
    staffName: string;
    role: string;
    pictureUrl: string;
  };

  let { staffId, staffName, role, pictureUrl } = data;

  type Student = {
    studNo: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender?: string;
    age?: number;
    birthDate?: string;
    birthPlace?: string;
    address?: string;
    houseNo?: string;
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    contactNumber?: string;
    email?: string;
    pictureId?: string;
    pictureUrl?: string;
    course: string;
    yearLevelId?: string;
    sectionId?: string;
    guardian?: string;
    guardianPhone?: string;
    mother?: string;
    father?: string;
    nationality?: string;
    religion?: string;
    civilStatus?: string;
    [key: string]: unknown;
  };

  let form: Student = {
    studNo: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    age: 0,
    birthDate: '',
    birthPlace: '',
    address: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    contactNumber: '',
    email: '',
    pictureId: '',
    pictureUrl: '',
    course: '',
    yearLevelId: '',
    sectionId: '',
    guardian: '',
    guardianPhone: '',
    mother: '',
    father: '',
    nationality: '',
    religion: '',
    civilStatus: ''
  };

  let error = '';
  let success = '';
  let isSubmitting = false;

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  let fileInput: HTMLInputElement;
  let previewUrl = '';
  let uploadingPhoto = false;

  let provinces: any[] = [];
  let cities: any[] = [];
  let barangays: any[] = [];

  let selectedProvince = '';
  let selectedCity = '';

  // Add a mapping for course code to courseId (replace with real IDs from your DB)
  const courseCodeToId = {
    "BSBA-MM": "course-id-1",
    "BSBA-FM": "course-id-2",
    "BSCS": "course-id-3",
    "BSCrim": "course-id-4",
    "BPEd": "course-id-5",
    "BSEd-Filipino": "course-id-6",
    "BSEd-English": "course-id-7",
    "BSEd-Math": "course-id-8",
    "BSEd-Science": "course-id-9",
    "BSEd-TLE-IA": "course-id-10",
    "BSEd-TLE-HE": "course-id-11",
    "BEEd": "course-id-12",
    "BSTrM": "course-id-13"
  };

  // Add mappings for year levels and sections (replace with real data from your DB)
  const yearLevels = [
    { id: 'year-1', name: '1st Year' },
    { id: 'year-2', name: '2nd Year' },
    { id: 'year-3', name: '3rd Year' },
    { id: 'year-4', name: '4th Year' }
  ];
  const sections = [
    { id: 'section-1', name: 'A' },
    { id: 'section-2', name: 'B' }
    // ...fetch from DB in real app...
  ];

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  function toggleSidebarCollapsed() {
    sidebarCollapsed = !sidebarCollapsed;
  }
  function closeSidebar() {
    sidebarOpen = false;
  }

  function handlePhotoChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files[0]) {
      previewUrl = URL.createObjectURL(files[0]);
      error = '';
    }
  }

  async function uploadStudentPhoto(): Promise<{ pictureId?: string; pictureUrl?: string; error?: string }> {
    if (!fileInput.files?.[0]) return {};
    uploadingPhoto = true;
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('username', form.studNo || 'student');
    try {
      const res = await fetch('/api/pic_api', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      uploadingPhoto = false;
      if (data.success) {
        return { pictureId: data.data.public_id, pictureUrl: data.data.url };
      } else {
        return { error: data.error || 'Photo upload failed.' };
      }
    } catch (e) {
      uploadingPhoto = false;
      return { error: 'Photo upload failed.' };
    }
  }

  async function addStudent() {
    error = '';
    success = '';
    isSubmitting = true;

    // List of required fields and their display names
    const requiredFields = [
      { key: 'studNo', label: 'Student Number' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'course', label: 'Course' }
    ];

    // Find missing fields
    const missing = requiredFields.filter(f => !form[f.key]);
    if (missing.length > 0) {
      error = `Please fill in the following required field(s): ${missing.map(f => f.label).join(', ')}`;
      isSubmitting = false;
      return;
    }

    // 1. Upload photo if selected
    let photoResult: { pictureId?: string; pictureUrl?: string; error?: string } = {};
    if (fileInput.files?.[0]) {
      photoResult = await uploadStudentPhoto();
      if (photoResult.error) {
        error = photoResult.error;
        isSubmitting = false;
        return;
      }
    }

    // 2. Prepare payload for API (match backend schema)
    const payload = {
      studNo: form.studNo,
      firstName: form.firstName,
      middleName: form.middleName || null,
      lastName: form.lastName,
      gender: form.gender || null,
      age: form.age ? Number(form.age) : null,
      birthDate: form.birthDate || null,
      birthPlace: form.birthPlace || null,
      address: form.address || null,
      houseNo: form.houseNo || null,
      street: form.street || null,
      barangay: form.barangay || null,
      city: form.city || null,
      province: form.province || null,
      zipCode: form.zipCode || null,
      contactNumber: form.contactNumber || null,
      email: form.email || null,
      pictureId: form.pictureId || null,
      pictureUrl: form.pictureUrl || null,
      course: form.course,
      yearLevel: form.yearLevel || null,
      section: form.section || null,
      guardian: form.guardian || null,
      guardianPhone: form.guardianPhone || null,
      mother: form.mother || null,
      father: form.father || null,
      nationality: form.nationality || null,
      religion: form.religion || null,
      civilStatus: form.civilStatus || null
    };

    try {
      const res = await fetch('/api/students/add_student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) {
        error = responseData.error || 'Failed to add student.';
        isSubmitting = false;
        return;
      }

      success = responseData.message || 'Student added successfully!';
      form = {
        studNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        age: 0,
        birthDate: '',
        birthPlace: '',
        address: '',
        houseNo: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        zipCode: '',
        contactNumber: '',
        email: '',
        pictureId: '',
        pictureUrl: '',
        course: '',
        yearLevelId: '',
        sectionId: '',
        guardian: '',
        guardianPhone: '',
        mother: '',
        father: '',
        nationality: '',
        religion: '',
        civilStatus: ''
      };
      previewUrl = '';
      if (fileInput) fileInput.value = '';
      setTimeout(() => goto('/students'), 1500);
    } catch (e) {
      error = 'Failed to add student. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  onMount(async () => {
    provinces = await fetch('https://psgc.gitlab.io/api/provinces/').then(r => r.json());
  });

  $: if (selectedProvince) {
    fetch(`https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities-municipalities/`)
      .then(r => r.json())
      .then(data => {
        cities = data;
        selectedCity = '';
        barangays = [];
        form.city = '';
        form.barangay = '';
      });
  }

  $: if (selectedCity) {
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity}/barangays/`)
      .then(r => r.json())
      .then(data => {
        barangays = data;
        form.barangay = '';
      });
  }

  // Sync selected values to form
  $: form.province = provinces.find(p => p.code === selectedProvince)?.name || '';
  $: form.city = cities.find(c => c.code === selectedCity)?.name || '';
</script>

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffId} {staffName} {role} {closeSidebar} {sidebarCollapsed} pictureUrl={pictureUrl} />
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
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <form on:submit|preventDefault={addStudent} class="divide-y divide-gray-200 dark:divide-gray-700">
              
              <!-- Photo Upload Section -->
              <div class="p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <div class="relative">
                    <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 dark:bg-gray-700">
                      {#if previewUrl}
                        <img src={previewUrl} alt="Student Preview" class="w-full h-full object-cover" />
                      {:else}
                        <div class="w-full h-full flex items-center justify-center">
                          <svg class="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                    {#if uploadingPhoto}
                      <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    {/if}
                  </div>
                  <div class="flex-1 text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Student Photo</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Upload a clear photo of the student (optional)</p>
                    <input
                      type="file"
                      accept="image/*"
                      bind:this={fileInput}
                      on:change={handlePhotoChange}
                      disabled={isSubmitting}
                      class="hidden"
                      id="photo-upload"
                    />
                    <label for="photo-upload" class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose Photo
                    </label>
                  </div>
                </div>
              </div>

              <!-- Basic Information Section -->
              <div class="p-6 sm:p-8">
                <BasicInfoForm {form} {isSubmitting} />
              </div>

              <!-- Personal Information Section -->
              <div class="p-6 sm:p-8">
                <PersonalInfoForm
                  {form}
                  {isSubmitting}
                  {provinces}
                  {cities}
                  {barangays}
                  bind:selectedProvince
                  bind:selectedCity
                />
              </div>

              <!-- Family Information Section -->
              <div class="p-6 sm:p-8">
                <FamilyInfoForm {form} {isSubmitting} />
              </div>

              <!-- Submit Section -->
              <div class="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900">
                <div class="flex flex-col sm:flex-row gap-4 justify-end">
                  <button 
                    type="button"
                    class="btn btn-secondary inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 min-w-[120px] transition-all duration-200"
                    on:click={() => goto('/students')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    class="btn btn-primary inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[120px] transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {#if isSubmitting}
                      <div class="flex items-center">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding Student...
                      </div>
                    {:else}
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Student
                      </div>
                    {/if}
                  </button>
                </div>

                <!-- Status Messages -->
                {#if error}
                  <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-red-700 dark:text-red-300 font-medium">{error}</span>
                    </div>
                  </div>
                {/if}

                {#if success}
                  <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-green-700 dark:text-green-300 font-medium">{success}</span>
                    </div>
                  </div>
                {/if}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

<style>
  .form-label.required::after {
    content: " *";
    color: #ef4444; /* Tailwind's text-red-500 */
  }
</style>