<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { goto } from '$app/navigation';

  // You may want to get these from the parent layout or session in a real app
  export let data: any;
  let staffId = data?.staffId ?? '';
  let staffName = data?.staffName ?? '';
  let role = data?.role ?? '';
  let pictureUrl = data?.pictureUrl ?? '';

  let username = '';
  let email = '';
  let newRole = 'teacher';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let success = '';

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  const roles = ['admin', 'teacher', 'registrar', 'staff', 'coordinator'];

  async function handleSubmit() {
    error = '';
    success = '';

    if (!username || !email || !newRole || !password || !confirmPassword) {
      error = 'All fields are required.';
      return;
    }
    if (password !== confirmPassword) {
      error = 'Passwords do not match.';
      return;
    }

    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, role: newRole, password })
    });

    if (res.ok) {
      success = 'Staff added successfully!';
      setTimeout(() => goto('/staff'), 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      error = data?.message || 'Failed to add staff.';
    }
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
      <div class="max-w-xl mx-auto">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow p-8">
          <h1 class="text-2xl font-bold mb-6 text-blue-900 dark:text-white">Add New Staff</h1>
          {#if error}
            <div class="mb-4 text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded p-2">{error}</div>
          {/if}
          {#if success}
            <div class="mb-4 text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded p-2">{success}</div>
          {/if}
          <form on:submit|preventDefault={handleSubmit} class="space-y-5">
            <div>
              <label class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Username</label>
              <input type="text" bind:value={username} class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white" required />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email</label>
              <input type="email" bind:value={email} class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white" required />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Role</label>
              <select bind:value={newRole} class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white" required>
                {#each roles as r}
                  <option value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
              <input type="password" bind:value={password} class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white" required minlength="6" />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
              <input type="password" bind:value={confirmPassword} class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white" required minlength="6" />
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
              Add Staff
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</div>