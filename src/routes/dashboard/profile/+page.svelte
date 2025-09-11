<script lang="ts">
  import Navbar from '$lib/component/Navbar.svelte';
  import Sidebar from '$lib/component/Sidebar.svelte';
  import ProfilePictureUpload from '$lib/component/ProfilePictureUpload.svelte';
  import { goto } from '$app/navigation';

  export let data: {
    staffId?: string;
    staffName?: string;
    role?: string;
    pictureId?: string;
    pictureUrl?: string;
  };

  let staffId = data?.staffId ?? '';
  let staffName = data?.staffName ?? 'User';
  let role = data?.role ?? '';
  let currentPicture = data?.pictureUrl ?? '';

  let sidebarOpen = false;
  let sidebarCollapsed = true;

  let email = '';
  let password = '';
  let showPassword = false;
  let updatingInfo = false;
  let infoMessage = '';

  // Additional profile settings
  let notifications = {
    email: true,
    push: false,
    sms: false
  };
  let theme = 'light';
  let language = 'en';

  function toggleSidebar() { sidebarOpen = !sidebarOpen; }
  function toggleSidebarCollapsed() { sidebarCollapsed = !sidebarCollapsed; }
  function closeSidebar() { sidebarOpen = false; }

  function toggleShowPassword() {
    showPassword = !showPassword;
  }

  function handlePictureUpdate(event: CustomEvent) {
    currentPicture = event.detail.url;
  }

  async function updateProfileInfo() {
    updatingInfo = true;
    infoMessage = '';
    try {
      const res = await fetch('/api/profile/update_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.success) {
        infoMessage = 'Profile info updated!';
      } else {
        infoMessage = json.error || 'Failed to update info.';
      }
    } catch (e) {
      infoMessage = 'Network error. Please try again.';
    } finally {
      updatingInfo = false;
    }
  }

  async function updatePreferences() {
    // Placeholder for updating preferences
    alert('Preferences updated!');
  }
</script>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffId} {staffName} {role} {closeSidebar} {sidebarCollapsed} pictureUrl={currentPicture} />
    </div>
  </aside>
  
  <!-- Mobile sidebar overlay -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <div class="fixed inset-0 bg-black opacity-40" on:click={closeSidebar}></div>
      <div class="relative z-50 w-64 transition-all duration-300">
        <Sidebar {staffId} {staffName} {role} {closeSidebar} sidebarCollapsed={false} pictureUrl={currentPicture} />
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="flex-1 flex flex-col min-w-0">
    <Navbar
      {staffId}
      {staffName}
      {role}
      {sidebarOpen}
      {toggleSidebar}
      {sidebarCollapsed}
      {toggleSidebarCollapsed}
      pictureUrl={currentPicture}
    />

    <main class="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
      <div class="w-full max-w-none xl:max-w-8xl mx-auto space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 xl:gap-12">
          <!-- Profile Section -->
          <div class="flex flex-col items-start w-full xl:w-1/3 space-y-4">
            <ProfilePictureUpload
              {currentPicture}
              {staffId}
              on:update={handlePictureUpdate}
            />
            <div class="mt-2">
              <h2 class="text-lg font-bold text-blue-900 dark:text-white">{staffName}</h2>
              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mt-1">
                {role}
              </span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mt-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>ID: {staffId}</span>
            </div>
            <div class="w-full space-y-3 pt-4 border-t border-blue-200/50 dark:border-blue-700/50">
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Last updated: Today</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span>Account Active</span>
              </div>
            </div>
          </div>

          <!-- Account & Security Settings Section -->
          <div class="flex-1 space-y-6">
            <!-- Account Information -->
            <div>
              <h3 class="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">Account Information</h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={staffName}
                    readonly
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <input
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={role}
                    readonly
                  />
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div>
              <h3 class="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">Security Settings</h3>
              <div class="space-y-4 lg:space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        class="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        bind:value={email}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        class="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        bind:value={password}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                        on:click={toggleShowPassword}
                        tabindex="0"
                      >
                        {#if showPassword}
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        {:else}
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.432 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        {/if}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row sm:justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    on:click={updateProfileInfo}
                    disabled={updatingInfo}
                  >
                    {#if updatingInfo}
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    {:else}
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span>Update Security</span>
                    {/if}
                  </button>
                </div>
                {#if infoMessage}
                  <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-start space-x-2 mt-4">
                    <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-sm">{infoMessage}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions - Mobile optimized -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Quick Actions
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">Add Skills</div>
                  <div class="text-gray-500 dark:text-gray-400 text-xs">Update your skills</div>
                </div>
              </div>
            </button>
            
            <button class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">Verify Account</div>
                  <div class="text-gray-500 dark:text-gray-400 text-xs">Complete verification</div>
                </div>
              </div>
            </button>
            
            <button class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                  <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">Download Data</div>
                  <div class="text-gray-500 dark:text-gray-400 text-xs">Export your data</div>
                </div>
              </div>
            </button>
            
            <button class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">Delete Account</div>
                  <div class="text-gray-500 dark:text-gray-400 text-xs">Permanently delete</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

<style>
  /* Custom scrollbar */
  main::-webkit-scrollbar {
    width: 8px;
  }
  
  main::-webkit-scrollbar-track {
    background-color: #f3f4f6; /* gray-100 */
  }
  @media (prefers-color-scheme: dark) {
    main::-webkit-scrollbar-track {
      background-color: #1f2937; /* gray-800 */
    }
  }
  main::-webkit-scrollbar-thumb {
    background-color: #d1d5db; /* gray-300 */
    border-radius: 9999px;
  }
  @media (prefers-color-scheme: dark) {
    main::-webkit-scrollbar-thumb {
      background-color: #4b5563; /* gray-600 */
    }
  }
  main::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af; /* gray-400 */
  }
  @media (prefers-color-scheme: dark) {
    main::-webkit-scrollbar-thumb:hover {
      background-color: #6b7280; /* gray-500 */
    }
  }

  /* Custom focus styles */
  input:focus, select:focus, button:focus {
    outline: none;
  }
  
  /* Smooth transitions */
  * {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  /* Responsive utilities */
  @media (min-width: 1536px) {
    .max-w-8xl {
      max-width: 88rem;
    }
  }
</style>