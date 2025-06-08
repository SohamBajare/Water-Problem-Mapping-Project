const loginBtn = document.getElementById('show-login');
    const signupBtn = document.getElementById('show-signup');
    const authLoginBtn = document.getElementById('show-authLogin');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authLoginForm = document.getElementById('authLogin-form');

    loginBtn.onclick = () => {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      authLoginForm.classList.add('hidden')
    };

    authLoginBtn.onclick = () => {
      loginForm.classList.add('hidden');
      signupForm.classList.add('hidden');
      authLoginForm.classList.remove('hidden')
    };

    signupBtn.onclick = () => {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      authLoginForm.classList.add('hidden')
    };