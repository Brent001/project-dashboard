<script lang="ts">
  export let form;
  
  let showPassword = false;
  let password = '';
  let confirmPassword = '';
  let passwordStrength = 0;
  let passwordMatch = true;
  
  // Password strength checker
  function checkPasswordStrength(pass: string) {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  }
  
  function handlePasswordInput() {
    passwordStrength = checkPasswordStrength(password);
    passwordMatch = confirmPassword === '' || password === confirmPassword;
  }
  
  function handleConfirmPasswordInput() {
    passwordMatch = password === confirmPassword;
  }
  
  function getStrengthText(strength: number) {
    if (strength <= 1) return 'Very Weak';
    if (strength === 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  }
  
  function getStrengthColor(strength: number) {
    if (strength <= 1) return 'text-red-600';
    if (strength === 2) return 'text-orange-500';
    if (strength === 3) return 'text-yellow-500';
    if (strength === 4) return 'text-blue-500';
    return 'text-green-600';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
  
  <!-- DESKTOP LAYOUT (lg screens and up) -->
  <div class="hidden lg:flex min-h-screen">
    <!-- Left Side - College Hero Section -->
    <div class="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-800 relative overflow-hidden">
      <!-- Academic Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 200 200" fill="currentColor">
          <defs>
            <pattern id="academic-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#academic-grid)" />
        </svg>
      </div>
      
      <!-- College Hero Content -->
      <div class="text-center text-white z-10 max-w-xl px-8">
        <div class="mb-8">
          <!-- College Logo/Icon -->
          <div class="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold mb-4 leading-tight">Student Information System</h1>
          <p class="text-xl text-blue-100 leading-relaxed mb-2">Welcome to Your College Portal</p>
          <p class="text-lg text-blue-200">Initialize your SIS administrator account to manage student records, courses, and academic operations.</p>
        </div>
        
        <div class="space-y-4 text-left bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 class="text-xl font-semibold mb-4 text-center">System Features</h3>
          <div class="grid grid-cols-1 gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <span class="text-blue-100">Student Enrollment Management</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <span class="text-blue-100">Course & Grade Management</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <span class="text-blue-100">Academic Reports & Analytics</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span class="text-blue-100">Secure Data Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Side - Admin Setup Form -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">System Administrator Setup</h2>
          <p class="text-gray-600">Create your admin account to configure the Student Information System</p>
        </div>
        
        <form method="POST" enctype="multipart/form-data" class="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
          <!-- Error Message -->
          {#if form?.error}
            <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div class="flex">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <p class="text-red-700 text-sm">{form.error}</p>
              </div>
            </div>
          {/if}

          <!-- Form fields -->
          <div class="space-y-5">
            <!-- Administrator ID/Username -->
            <div class="space-y-2">
              <label for="username" class="block text-sm font-semibold text-gray-700">Administrator ID *</label>
              <div class="relative">
                <input 
                  id="username" name="username" type="text" required minlength="3" maxlength="30" pattern="[a-zA-Z0-9_]+"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder="admin_username" autocomplete="username"
                />
                <svg class="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                </svg>
              </div>
              <p class="text-xs text-gray-500">This will be your system administrator login ID</p>
            </div>

            <!-- Official Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-gray-700">Official Email Address *</label>
              <div class="relative">
                <input 
                  id="email" name="email" type="email" required 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder="admin@college.edu" autocomplete="email"
                />
                <svg class="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
              <p class="text-xs text-gray-500">Use your official college email address</p>
            </div>

            <!-- Secure Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-gray-700">Administrator Password *</label>
              <div class="relative">
                <input 
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required minlength="8"
                  bind:value={password} on:input={handlePasswordInput}
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder="Create secure password" autocomplete="new-password"
                />
                <button type="button" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600" on:click={() => showPassword = !showPassword}>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m6.018 6.018L12 12m1.878 1.878l2.122 2.122" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}/>
                  </svg>
                </button>
              </div>
              
              {#if password}
                <div class="space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Password Strength:</span>
                    <span class={getStrengthColor(passwordStrength)}>{getStrengthText(passwordStrength)}</span>
                  </div>
                  <div class="flex space-x-1">
                    {#each Array(5) as _, i}
                      <div class="flex-1 h-1.5 rounded-full {i < passwordStrength ? 
                        passwordStrength <= 1 ? 'bg-red-400' : passwordStrength === 2 ? 'bg-orange-400' : passwordStrength === 3 ? 'bg-yellow-400' : passwordStrength === 4 ? 'bg-blue-400' : 'bg-green-400' : 'bg-gray-200'}">
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label for="confirm_password" class="block text-sm font-semibold text-gray-700">Confirm Password *</label>
              <input 
                id="confirm_password" type="password" required bind:value={confirmPassword} on:input={handleConfirmPasswordInput}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 {!passwordMatch && confirmPassword ? 'border-red-300' : ''}" 
                placeholder="Confirm your password" autocomplete="new-password"
              />
              {#if !passwordMatch && confirmPassword}
                <p class="text-red-600 text-xs">Passwords do not match</p>
              {/if}
            </div>

            <!-- Administrator Profile Photo -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">Administrator Photo <span class="text-gray-400">(optional)</span></label>
              <label for="profile_picture" class="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div class="flex flex-col items-center">
                  <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span class="text-sm text-gray-500">Upload Administrator Photo</span>
                  <span class="text-xs text-gray-400 mt-1">PNG, JPG (Max 2MB)</span>
                </div>
                <input id="profile_picture" name="profile_picture" type="file" accept="image/jpeg,image/jpg,image/png" class="hidden"/>
              </label>
            </div>
          </div>

          <!-- Academic System Notice -->
          <div class="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md">
            <div class="flex">
              <svg class="w-5 h-5 text-indigo-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p class="text-indigo-700 text-sm font-medium">Academic System Access</p>
                <p class="text-indigo-600 text-xs mt-1">This administrator account will have full access to student records, academic data, and system configurations. Ensure compliance with educational privacy regulations.</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" disabled={!passwordMatch || passwordStrength < 3}
            class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            Initialize Student Information System
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- MOBILE LAYOUT (below lg screens) -->
  <div class="lg:hidden min-h-screen flex flex-col">
    <!-- Mobile College Header -->
    <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-6 py-8 text-center text-white">
      <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold mb-2">Student Information System</h1>
      <p class="text-indigo-100 text-sm">Administrator Setup</p>
    </div>

    <!-- Mobile Form -->
    <div class="flex-1 px-4 py-6 bg-gray-50">
      <form method="POST" enctype="multipart/form-data" class="bg-white rounded-xl shadow-lg p-6 space-y-4">
        
        {#if form?.error}
          <div class="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p class="text-red-700 text-sm">{form.error}</p>
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Mobile Administrator ID -->
          <div>
            <label for="mobile_username" class="block text-sm font-medium text-gray-700 mb-1">Administrator ID *</label>
            <input 
              id="mobile_username" name="username" type="text" required minlength="3" maxlength="30" pattern="[a-zA-Z0-9_]+"
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="Your admin ID" autocomplete="username"
            />
          </div>

          <!-- Mobile Email -->
          <div>
            <label for="mobile_email" class="block text-sm font-medium text-gray-700 mb-1">College Email *</label>
            <input 
              id="mobile_email" name="email" type="email" required 
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="admin@college.edu" autocomplete="email"
            />
          </div>

          <!-- Mobile Password -->
          <div>
            <label for="mobile_password" class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input 
                id="mobile_password" name="password" type={showPassword ? 'text' : 'password'} required minlength="8"
                bind:value={password} on:input={handlePasswordInput}
                class="w-full px-3 py-3 pr-12 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Create password" autocomplete="new-password"
              />
              <button type="button" class="absolute right-3 top-3 text-gray-400" on:click={() => showPassword = !showPassword}>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m6.018 6.018L12 12m1.878 1.878l2.122 2.122" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}/>
                </svg>
              </button>
            </div>
            
            {#if password}
              <div class="mt-2">
                <div class="flex space-x-1 mb-1">
                  {#each Array(5) as _, i}
                    <div class="flex-1 h-1 rounded-full {i < passwordStrength ? 
                      passwordStrength <= 1 ? 'bg-red-400' : passwordStrength === 2 ? 'bg-orange-400' : passwordStrength === 3 ? 'bg-yellow-400' : passwordStrength === 4 ? 'bg-blue-400' : 'bg-green-400' : 'bg-gray-200'}">
                    </div>
                  {/each}
                </div>
                <p class="text-xs {getStrengthColor(passwordStrength)}">{getStrengthText(passwordStrength)}</p>
              </div>
            {/if}
          </div>

          <!-- Mobile Confirm Password -->
          <div>
            <label for="mobile_confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input 
              id="mobile_confirm" type="password" required bind:value={confirmPassword} on:input={handleConfirmPasswordInput}
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 {!passwordMatch && confirmPassword ? 'border-red-300' : ''}" 
              placeholder="Confirm password" autocomplete="new-password"
            />
            {#if !passwordMatch && confirmPassword}
              <p class="text-red-600 text-xs mt-1">Passwords don't match</p>
            {/if}
          </div>

          <!-- Mobile Profile Picture -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Administrator Photo</label>
            <label for="mobile_picture" class="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-sm text-gray-500">Add Photo</span>
              </div>
              <input id="mobile_picture" name="profile_picture" type="file" accept="image/*" class="hidden"/>
            </label>
          </div>
        </div>

        <!-- Mobile Academic Notice -->
        <div class="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
            </svg>
            <div>
              <p class="text-indigo-700 text-sm font-medium">SIS Administrator</p>
              <p class="text-indigo-600 text-xs mt-1">Full access to student records and academic data</p>
            </div>
          </div>
        </div>

        <!-- Mobile Submit Button -->
        <button type="submit" disabled={!passwordMatch || passwordStrength < 3}
          class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg py-4 text-base font-semibold hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          Setup Student Information System
        </button>
      </form>
    </div>

    <!-- Mobile Footer -->
    <div class="px-4 py-4 text-center bg-white border-t">
      <p class="text-xs text-gray-500">🎓 Academic Data Protection • FERPA Compliant</p>
    </div>
  </div>
</div>