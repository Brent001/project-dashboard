<script lang="ts">
  export let form: any;
  export let isSubmitting: boolean;
  export let provinces: any[];
  export let cities: any[];
  export let barangays: any[];
  export let selectedProvince: string;
  export let selectedCity: string;
</script>

<div class="mb-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Personal Information</h3>
  <p class="text-sm text-gray-600 dark:text-gray-300">Additional details about the student</p>
</div>
<div class="flex flex-col gap-4">
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="gender">Gender</label>
      <select id="gender" class="form-select w-full" bind:value={form.gender} disabled={isSubmitting}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="age">Age</label>
      <input id="age" type="number" min="0" max="150" class="form-input w-full" placeholder="Enter age" bind:value={form.age} disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="birthDate">Birth Date</label>
      <input id="birthDate" type="date" class="form-input w-full" bind:value={form.birthDate} disabled={isSubmitting} />
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="birthPlace">Birth Place</label>
      <input id="birthPlace" type="text" class="form-input w-full" placeholder="Enter birth place" bind:value={form.birthPlace} disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="address">Address</label>
      <input id="address" type="text" class="form-input w-full" placeholder="Enter complete address" bind:value={form.address} disabled={isSubmitting} />
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="houseNo">House/Block/Lot No.</label>
      <input id="houseNo" type="text" class="form-input w-full" placeholder="House/Block/Lot No." bind:value={form.houseNo} disabled={isSubmitting} />
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="street">Street</label>
      <input id="street" type="text" class="form-input w-full" placeholder="Street" bind:value={form.street} disabled={isSubmitting} />
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="province">Province</label>
      <select
        id="province"
        class="form-select w-full"
        bind:value={selectedProvince}
        disabled={isSubmitting}
      >
        <option value="">Select Province</option>
        {#each provinces as province}
          <option value={province.code}>{province.name}</option>
        {/each}
      </select>
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="city">City/Municipality</label>
      <select
        id="city"
        class="form-select w-full"
        bind:value={selectedCity}
        disabled={!selectedProvince || isSubmitting}
      >
        <option value="">Select City/Municipality</option>
        {#each cities as city}
          <option value={city.code}>{city.name}</option>
        {/each}
      </select>
    </div>
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="barangay">Barangay</label>
      <select
        id="barangay"
        class="form-select w-full"
        bind:value={form.barangay}
        disabled={!selectedCity || isSubmitting}
      >
        <option value="">Select Barangay</option>
        {#each barangays as barangay}
          <option value={barangay.name}>{barangay.name}</option>
        {/each}
      </select>
    </div>
  </div>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex flex-col">
      <label class="form-label" for="zipCode">Zip Code</label>
      <input id="zipCode" type="text" class="form-input w-full" placeholder="Zip Code" bind:value={form.zipCode} disabled={isSubmitting} />
    </div>
  </div>
</div>