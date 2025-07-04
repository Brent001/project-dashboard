<script lang="ts">
  export let form;
  export let isSubmitting: boolean;
</script>

<div class="mb-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Basic Information</h3>
  <p class="text-sm text-gray-600 dark:text-gray-300">Required fields are marked with *</p>
</div>
<div class="flex flex-col gap-4">
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label required" for="studNo">Student Number</label>
      <input id="studNo" type="text" class="form-input w-full" placeholder="Enter student number" bind:value={form.studNo} required disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label required" for="firstName">First Name</label>
      <input id="firstName" type="text" class="form-input w-full" placeholder="Enter first name" bind:value={form.firstName} required disabled={isSubmitting} />
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="middleName">Middle Name</label>
      <input id="middleName" type="text" class="form-input w-full" placeholder="Enter middle name" bind:value={form.middleName} disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label required" for="lastName">Last Name</label>
      <input id="lastName" type="text" class="form-input w-full" placeholder="Enter last name" bind:value={form.lastName} required disabled={isSubmitting} />
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label required" for="course">Course</label>
      <select id="course" class="form-select w-full" bind:value={form.course} required disabled={isSubmitting}>
        <option value="" disabled>Select Course</option>
        <option value="BSBA-MM">BSBA - Marketing Management</option>
        <option value="BSBA-FM">BSBA - Financial Management</option>
        <option value="BSCS">BS Computer Science</option>
        <option value="BSCrim">BS Criminology</option>
        <option value="BPEd">Bachelor of Physical Education</option>
        <option value="BSEd-Filipino">BSEd - Filipino</option>
        <option value="BSEd-English">BSEd - English</option>
        <option value="BSEd-Math">BSEd - Mathematics</option>
        <option value="BSEd-Science">BSEd - Science and Technology</option>
        <option value="BSEd-TLE-IA">BSEd-TLE - Industrial Arts</option>
        <option value="BSEd-TLE-HE">BSEd-TLE - Home Economics</option>
        <option value="BEEd">Bachelor of Elementary Education</option>
        <option value="BSTrM">BS Tourism Management</option>
      </select>
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="yearLevel">Year Level</label>
      <select id="yearLevel" class="form-select w-full" bind:value={form.yearLevel} disabled={isSubmitting}>
        <option value="">Select Year Level</option>
        <option value="1st Year">1st Year</option>
        <option value="2nd Year">2nd Year</option>
        <option value="3rd Year">3rd Year</option>
        <option value="4th Year">4th Year</option>
      </select>
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="section">Section</label>
      <input id="section" type="text" class="form-input w-full" placeholder="Enter section" bind:value={form.section} disabled={isSubmitting} />
    </div>
  </div>
</div>