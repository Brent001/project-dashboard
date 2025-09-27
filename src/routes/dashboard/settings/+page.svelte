<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import Sidebar from '$lib/component/Sidebar.svelte';

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

  function toggleSidebar() { sidebarOpen = !sidebarOpen; }
  function toggleSidebarCollapsed() { sidebarCollapsed = !sidebarCollapsed; }
  function closeSidebar() { sidebarOpen = false; }

  // Settings state
  let theme = 'system'; // 'light', 'dark', 'system'
  let notifications = true;
  let settingsExist = false;
  let isLoading = false;

  // Apply theme to document - completely rewritten for reliability
  function applyTheme(selectedTheme: string) {
    if (typeof document === 'undefined') return;
    
    console.log('🎨 Applying theme:', selectedTheme);
    
    const html = document.documentElement;
    const body = document.body;
    
    // Remove dark class from both html and body (some setups use body)
    html.classList.remove('dark');
    body?.classList.remove('dark');
    
    if (selectedTheme === 'dark') {
      html.classList.add('dark');
      body?.classList.add('dark');
      console.log('✅ Dark mode activated');
    } else if (selectedTheme === 'light') {
      // Already removed dark classes above
      console.log('☀️ Light mode activated');
    } else if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
        body?.classList.add('dark');
        console.log('🖥️ System theme: dark mode');
      } else {
        console.log('🖥️ System theme: light mode');
      }
    }
    
    console.log('📋 Final HTML classes:', html.className);
    console.log('📋 Final BODY classes:', body?.className || 'no body element');
  }

  // Handle theme selection - more aggressive approach
  function selectTheme(newTheme: string) {
    console.log('Theme selected:', newTheme); // Debug log
    theme = newTheme;
    
    // Immediate DOM manipulation
    const html = document.documentElement;
    
    if (newTheme === 'light') {
      html.classList.remove('dark');
      console.log('Immediately removed dark class for light theme');
    } else if (newTheme === 'dark') {
      html.classList.add('dark');
      console.log('Immediately added dark class for dark theme');
    } else if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      console.log('Applied system theme, prefersDark:', prefersDark);
    }
    
    // Also call the original function as backup
    applyTheme(newTheme);
  }

  // Test function - you can call this from browser console
  function testTheme() {
    console.log('Testing theme switching...');
    const html = document.documentElement;
    console.log('Current classes:', html.classList.toString());
    
    // Test removing dark class
    html.classList.remove('dark');
    console.log('After removing dark:', html.classList.toString());
    
    // Test adding dark class
    setTimeout(() => {
      html.classList.add('dark');
      console.log('After adding dark:', html.classList.toString());
    }, 1000);
    
    // Test removing again
    setTimeout(() => {
      html.classList.remove('dark');
      console.log('After removing dark again:', html.classList.toString());
    }, 2000);
  }
  
  // Make test function available globally for debugging
  if (typeof window !== 'undefined') {
    window.testTheme = testTheme;
  }

  // Fetch settings from API
  onMount(async () => {
    console.log('Component mounted, staffId:', staffId); // Debug log
    
    if (!staffId) {
      applyTheme('system');
      return;
    }
    
    try {
      const res = await fetch(`/api/settings?staffId=${staffId}`);
      if (res.ok) {
        const settings = await res.json();
        console.log('Loaded settings:', settings); // Debug log
        
        if (settings && settings.id) {
          settingsExist = true;
          theme = settings.theme ?? 'system';
          notifications = settings.notifications ?? true;
        } else {
          settingsExist = false;
          theme = 'system';
          notifications = true;
        }
      } else {
        console.error('Failed to fetch settings');
        settingsExist = false;
        theme = 'system';
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      settingsExist = false;
      theme = 'system';
    }
    
    // Apply the loaded theme
    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  });

  // Save settings
  async function saveSettings() {
    if (!staffId || isLoading) return;
    
    console.log('Saving settings:', { theme, notifications }); // Debug log
    isLoading = true;
    
    try {
      const method = settingsExist ? 'PUT' : 'POST';
      const res = await fetch('/api/settings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, theme, notifications })
      });

      if (res.ok) {
        settingsExist = true;
        alert('Settings saved successfully!');
      } else {
        const error = await res.json();
        alert(`Failed to save settings: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:block">
    <div class={`transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <Sidebar {staffId} {staffName} {role} {closeSidebar} {sidebarCollapsed} pictureUrl={currentPicture} />
    </div>
  </aside>
  
  <!-- Sidebar overlay for mobile -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 flex md:hidden">
      <button
        type="button"
        aria-label="Close sidebar"
        class="fixed inset-0 bg-black opacity-40"
        on:click={closeSidebar}
        tabindex="0"
      ></button>
      <div
        class="relative z-50 w-64 h-full bg-white dark:bg-gray-900 transition-all duration-300"
        on:click|stopPropagation
      >
        <Sidebar {staffId} {staffName} {role} {closeSidebar} sidebarCollapsed={false} pictureUrl={currentPicture} />
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
      pictureUrl={currentPicture}
    />

    <main class="flex-1 flex items-center justify-center px-2 md:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-lg transition-colors duration-200">
        <h1 class="text-3xl font-bold text-blue-900 dark:text-white mb-8 text-center">Settings</h1>
        
        <!-- Debug info -->
        <div class="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p class="text-gray-600 dark:text-gray-300">Current theme: {theme}</p>
          <p class="text-gray-600 dark:text-gray-300">Settings exist: {settingsExist}</p>
          
          <!-- Visual test box -->
          <div class="mt-2 p-2 border-2 border-blue-500 dark:border-yellow-500 bg-white dark:bg-gray-800 rounded">
            <p class="text-blue-600 dark:text-yellow-400 font-bold">
              Theme Test Box: This should be blue text on white background in light mode, 
              yellow text on gray background in dark mode.
            </p>
          </div>
          
          <button 
            type="button" 
            class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
            on:click={() => {
              const html = document.documentElement;
              console.log('Manual check - HTML classes:', html.classList.toString());
              console.log('Has dark class:', html.classList.contains('dark'));
            }}
          >
            Check HTML Classes
          </button>
          <button 
            type="button" 
            class="mt-2 ml-2 px-3 py-1 bg-green-500 text-white rounded text-xs"
            on:click={() => testTheme()}
          >
            Test Theme Switch
          </button>
          
          <!-- Direct theme buttons for testing -->
          <div class="mt-2">
            <button 
              type="button" 
              class="px-2 py-1 bg-yellow-500 text-black rounded text-xs mr-1"
              on:click={() => {
                document.documentElement.classList.remove('dark');
                console.log('FORCE LIGHT: Removed dark class');
              }}
            >
              Force Light
            </button>
            <button 
              type="button" 
              class="px-2 py-1 bg-purple-500 text-white rounded text-xs"
              on:click={() => {
                document.documentElement.classList.add('dark');
                console.log('FORCE DARK: Added dark class');
              }}
            >
              Force Dark
            </button>
          </div>
        </div>
        
        <form class="space-y-8" on:submit|preventDefault={saveSettings}>
          <!-- Theme Setting -->
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 bg-blue-100 dark:bg-blue-800 rounded-full p-3">
              <svg class="w-7 h-7 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-10.66l-.71.71M4.05 19.95l-.71-.71M21 12h-1M4 12H3m16.66 6.66l-.71-.71M4.05 4.05l-.71.71"/>
                <circle cx="12" cy="12" r="5" stroke-width="2"/>
              </svg>
            </div>
            <div class="flex-1">
              <label class="block text-lg font-medium text-blue-900 dark:text-white mb-2">Theme</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={theme === 'light'}
                    on:click={() => selectTheme('light')}
                    class="accent-blue-600" 
                  />
                  <span class="text-gray-700 dark:text-gray-300">Light</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={theme === 'dark'}
                    on:click={() => selectTheme('dark')}
                    class="accent-blue-600" 
                  />
                  <span class="text-gray-700 dark:text-gray-300">Dark</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="system" 
                    checked={theme === 'system'}
                    on:click={() => selectTheme('system')}
                    class="accent-blue-600" 
                  />
                  <span class="text-gray-700 dark:text-gray-300">System</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Notifications Setting -->
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 bg-green-100 dark:bg-green-800 rounded-full p-3">
              <svg class="w-7 h-7 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div class="flex-1">
              <label class="block text-lg font-medium text-blue-900 dark:text-white mb-2">Notifications</label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" bind:checked={notifications} class="accent-green-600" />
                <span class="text-gray-700 dark:text-gray-300">Enable notifications</span>
              </label>
            </div>
          </div>
          
          <!-- Save Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</div>