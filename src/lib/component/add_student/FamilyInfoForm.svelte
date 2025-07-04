<script lang="ts">
  export let form;
  export let isSubmitting: boolean;
</script>

<div class="mb-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Family Information</h3>
  <p class="text-sm text-gray-600 dark:text-gray-300">Emergency contacts and family details</p>
</div>
<div class="flex flex-col gap-4">
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="guardian">Guardian</label>
      <input id="guardian" type="text" class="form-input w-full" placeholder="Enter guardian's name" bind:value={form.guardian} disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="guardianPhone">Guardian Phone</label>
      <input id="guardianPhone" type="tel" class="form-input w-full" placeholder="Enter guardian's phone" bind:value={form.guardianPhone} disabled={isSubmitting} />
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="mother">Mother's Name</label>
      <input id="mother" type="text" class="form-input w-full" placeholder="Enter mother's name" bind:value={form.mother} disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="father">Father's Name</label>
      <input id="father" type="text" class="form-input w-full" placeholder="Enter father's name" bind:value={form.father} disabled={isSubmitting} />
    </div>
  </div>
</div>