<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let username = '';
  let password = '';
  let error = '';
  let loading = false;
  let darkMode = false;
  let showPassword = false;

  // Initialize dark mode from localStorage or system preference
  onMount(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      darkMode = JSON.parse(savedMode);
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateTheme();
  });

  function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    updateTheme();
  }

  function updateTheme() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  async function handleLogin() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error || 'Login failed';
        loading = false;
        return;
      }
      goto('/dashboard');
    } catch (e) {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <script>
    // Prevent flash of unstyled content
    (function() {
      const saved = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved ? JSON.parse(saved) : prefersDark;
      // Removed dark mode class toggling
    })();
  </script>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 transition-colors duration-300">
  <div class="relative w-full max-w-sm mx-2">
    <!-- Login card -->
    <div class="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
      <!-- Logo/Brand -->
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
          <!-- Book Icon -->
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-blue-900">
          College Portal
        </h2>
        <p class="text-gray-600 mt-1 text-sm">Staff Login</p>
      </div>

      {#if error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center animate-shake">
          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <!-- Username field -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1" for="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm transition-all duration-200"
            bind:value={username}
            required
            autocomplete="username"
            placeholder="Enter your username"
          />
        </div>

        <!-- Password field -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1" for="password">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm transition-all duration-200"
              bind:value={password}
              required
              autocomplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              on:click={togglePasswordVisibility}
              tabindex="-1"
            >
              {#if showPassword}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
              {:else}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <!-- Login button -->
        <button
          type="submit"
          class="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center shadow hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          disabled={loading}
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Signing in...
          {:else}
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Sign In
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
</style>