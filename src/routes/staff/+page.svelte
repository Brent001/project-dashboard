<script lang="ts">
  import Sidebar from '$lib/component/Sidebar.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { fly } from 'svelte/transition';
  import { formatDistanceToNow } from 'date-fns';
  import { browser } from '$app/environment';
  import { decrypt } from '$lib/client/crypto';

  export let data;

  type Staff = {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    pictureId?: string | null;
    pictureUrl?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  const { staffId, staffName, role, pictureUrl, encryptedData } = data as {
    staffId: string;
    staffName: string;
    role: string;
    pictureUrl: string;
    encryptedData: string;
  };

  let staffList: Staff[] = [];
  let decryptionError = false;

  // Only decrypt on the client
  if (browser && encryptedData) {
    try {
      console.log('Attempting to decrypt staff data...');
      const decryptedData = decrypt(encryptedData);
      console.log('Decryption successful, parsing JSON...');
      staffList = JSON.parse(decryptedData);
      console.log('Successfully parsed staff list:', staffList.length, 'items');
    } catch (e) {
      console.error('Failed to decrypt or parse staff list:', e);
      console.error('Encrypted data length:', encryptedData.length);
      console.error('Encrypted data preview:', encryptedData.substring(0, 100));
      staffList = [];
      decryptionError = true;
    }
  }

  let sidebarOpen = false;
  let sidebarCollapsed = true;
  let searchQuery = '';
  let selectedRole = 'all'; // Filter by role
  let statusFilter = 'all'; // Filter by active status
  let sortBy = 'username'; // Sort options
  let sortOrder = 'asc';

  // Available roles for filtering
  const roles = ['admin', 'teacher', 'registrar', 'staff', 'coordinator'];

  // Filter and sort staff
  $: filteredStaff = staffList
    .filter((s: Staff) => {
      const matchesSearch = 
        s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || s.role === selectedRole;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && s.isActive) ||
        (statusFilter === 'inactive' && !s.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'username':
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role?.toLowerCase() || '';
          bValue = b.role?.toLowerCase() || '';
          break;
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get staff counts by status
  $: activeStaffCount = staffList.filter(s => s.isActive).length;
  $: inactiveStaffCount = staffList.filter(s => !s.isActive).length;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function toggleSidebarCollapsed() {
    sidebarCollapsed = !sidebarCollapsed;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  function getFullName(staff: Staff): string {
    if (staff.firstName && staff.lastName) {
      return `${staff.firstName} ${staff.lastName}`;
    }
    return staff.username;
  }

  function getInitials(staff: Staff): string {
    if (staff.firstName && staff.lastName) {
      return (staff.firstName[0] + staff.lastName[0]).toUpperCase();
    }
    const name = staff.username;
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function getRoleBadgeColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'registrar':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'coordinator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  function handleSort(field: string) {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'asc';
    }
  }

  function resetFilters() {
    searchQuery = '';
    selectedRole = 'all';
    statusFilter = 'all';
    sortBy = 'username';
    sortOrder = 'asc';
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
      <!-- Show decryption error if it occurred -->
      {#if decryptionError}
        <div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Data Decryption Error
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>Unable to decrypt staff data. Please check your encryption configuration or refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Header Section with Stats -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white">Staff Management</h1>
          <div class="flex flex-wrap gap-4 mt-2">
            <p class="text-blue-600 dark:text-blue-400">
              <span class="font-semibold">{filteredStaff.length}</span> staff found
            </p>
            <p class="text-green-600 dark:text-green-400">
              <span class="font-semibold">{activeStaffCount}</span> active
            </p>
            <p class="text-red-600 dark:text-red-400">
              <span class="font-semibold">{inactiveStaffCount}</span> inactive
            </p>
          </div>
        </div>
        
        <!-- Quick Stats Cards -->
        <div class="flex gap-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="text-xs text-gray-500 dark:text-gray-400">Total Staff</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">{staffList.length}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="text-xs text-gray-500 dark:text-gray-400">Active</div>
            <div class="text-lg font-bold text-green-600">{activeStaffCount}</div>
          </div>
        </div>
      </div>

      <!-- Search and Filters Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              bind:value={searchQuery}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Role Filter -->
          <div class="min-w-0 sm:min-w-[140px]">
            <select
              bind:value={selectedRole}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              {#each roles as roleOption}
                <option value={roleOption}>{roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}</option>
              {/each}
            </select>
          </div>

          <!-- Status Filter -->
          <div class="min-w-0 sm:min-w-[120px]">
            <select
              bind:value={statusFilter}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <!-- Sort By -->
          <div class="min-w-0 sm:min-w-[120px]">
            <select
              bind:value={sortBy}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="username">Username</option>
              <option value="name">Full Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="created">Date Added</option>
            </select>
          </div>

          <!-- Reset Filters -->
          <button
            on:click={resetFilters}
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Staff Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    on:click={() => handleSort('name')}
                    class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Staff</span>
                    {#if sortBy === 'name'}
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortOrder === 'asc'}
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        {:else}
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                        {/if}
                      </svg>
                    {/if}
                  </button>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    on:click={() => handleSort('username')}
                    class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Username</span>
                    {#if sortBy === 'username'}
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortOrder === 'asc'}
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        {:else}
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                        {/if}
                      </svg>
                    {/if}
                  </button>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    on:click={() => handleSort('email')}
                    class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Email</span>
                    {#if sortBy === 'email'}
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortOrder === 'asc'}
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        {:else}
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                        {/if}
                      </svg>
                    {/if}
                  </button>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    on:click={() => handleSort('role')}
                    class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Role</span>
                    {#if sortBy === 'role'}
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortOrder === 'asc'}
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        {:else}
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                        {/if}
                      </svg>
                    {/if}
                  </button>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    on:click={() => handleSort('created')}
                    class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Added</span>
                    {#if sortBy === 'created'}
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortOrder === 'asc'}
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        {:else}
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                        {/if}
                      </svg>
                    {/if}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {#if filteredStaff.length === 0}
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                      </svg>
                      <p class="text-lg font-medium">
                        {decryptionError ? 'Unable to load staff data' : 'No staff found'}
                      </p>
                      <p class="text-sm">
                        {decryptionError ? 'Please refresh the page or check your connection' : 'Try adjusting your search or filters'}
                      </p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each filteredStaff as staff}
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden relative">
                          {#if staff.pictureUrl}
                            <img src={staff.pictureUrl} alt="Profile" class="w-10 h-10 object-cover rounded-full" />
                          {:else}
                            <span class="text-blue-600 dark:text-blue-400 font-medium text-sm">
                              {getInitials(staff)}
                            </span>
                          {/if}
                          {#if !staff.isActive}
                            <div class="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
                              </svg>
                            </div>
                          {/if}
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">
                            {getFullName(staff)}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">ID: {staff.id}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{staff.username}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{staff.email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRoleBadgeColor(staff.role)}">
                        {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {staff.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {#if staff.createdAt && !isNaN(new Date(staff.createdAt))}
                        {formatDistanceToNow(new Date(staff.createdAt), { addSuffix: true })}
                      {:else}
                        <span class="text-gray-400">N/A</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</div>