// ===== Auth (localStorage) =====
const STORAGE_KEY = 'emuio_users';
const SESSION_KEY = 'emuio_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, loggedInAt: Date.now() }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
  return !!getSession();
}

// ===== UI helpers =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function updateNavAuth() {
  const session = getSession();
  const navActions = document.querySelector('.nav-actions');
  const mobileActions = document.querySelector('.mobile-nav-actions');

  if (!navActions) return;

  if (session) {
    const email = session.email;
    const short = email.length > 18 ? email.slice(0, 15) + '…' : email;

    navActions.innerHTML = `
      <span class="user-email" title="${email}">${short}</span>
      <button class="btn btn-ghost" onclick="logout()">Log out</button>
      <a href="dashboard.html" class="btn btn-primary">Dashboard</a>
    `;

    if (mobileActions) {
      mobileActions.innerHTML = `
        <span class="user-email mobile" title="${email}">${email}</span>
        <a href="dashboard.html" class="btn btn-primary" onclick="closeMobileMenu()">Dashboard</a>
        <button class="btn btn-ghost" onclick="logout(); closeMobileMenu()">Log out</button>
      `;
    }
  } else {
    navActions.innerHTML = `
      <button class="btn btn-ghost" onclick="openModal('login')">Log in</button>
      <button class="btn btn-primary" onclick="openModal('signup')">Sign up free</button>
    `;

    if (mobileActions) {
      mobileActions.innerHTML = `
        <button class="btn btn-ghost" onclick="openModal('login'); closeMobileMenu()">Log in</button>
        <button class="btn btn-primary" onclick="openModal('signup'); closeMobileMenu()">Sign up free</button>
      `;
    }
  }
}

// ===== Auth actions =====
function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  const users = getUsers();

  if (isSignup) {
    if (users[email]) {
      showToast('An account with this email already exists. Try logging in.', 'error');
      return;
    }
    users[email] = {
      password: password,
      createdAt: new Date().toISOString()
    };
    saveUsers(users);
    setSession(email);
    closeModal();
    updateNavAuth();
    showToast('Welcome to EmuioHost, ' + email + '!');
    document.getElementById('authForm').reset();
  } else {
    if (!users[email] || users[email].password !== password) {
      showToast('Invalid email or password', 'error');
      return;
    }
    setSession(email);
    closeModal();
    updateNavAuth();
    showToast('Welcome back, ' + email + '!');
    document.getElementById('authForm').reset();
  }
}

function logout() {
  clearSession();
  updateNavAuth();
  showToast('Logged out successfully');
  if (window.location.pathname.includes('dashboard')) {
    window.location.href = 'index.html';
  }
}

function simulateOAuth() {
  const demoEmail = 'github-user@emuio.app';
  const users = getUsers();
  if (!users[demoEmail]) {
    users[demoEmail] = {
      password: 'github-oauth-demo',
      createdAt: new Date().toISOString(),
      provider: 'github'
    };
    saveUsers(users);
  }
  setSession(demoEmail);
  closeModal();
  updateNavAuth();
  showToast('Connected with GitHub! Welcome to EmuioHost.');
}

// ===== Modal =====
let isSignup = true;

function openModal(mode) {
  isSignup = mode === 'signup';
  updateModalUI();
  document.getElementById('authModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  closeMobileMenu();
}

function closeModal() {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleAuthMode() {
  isSignup = !isSignup;
  updateModalUI();
}

function updateModalUI() {
  const title = document.getElementById('modalTitle');
  const subtitle = document.getElementById('modalSubtitle');
  const submitBtn = document.getElementById('submitBtn');
  const switchText = document.getElementById('switchText');
  const switchBtn = document.getElementById('switchBtn');

  if (isSignup) {
    title.textContent = 'Create your free account';
    subtitle.textContent = 'No credit card. No subscriptions. Ever.';
    submitBtn.textContent = 'Sign up free';
    switchText.textContent = 'Already have an account?';
    switchBtn.textContent = 'Log in';
  } else {
    title.textContent = 'Welcome back';
    subtitle.textContent = 'Log in to your EmuioHost account.';
    submitBtn.textContent = 'Log in';
    switchText.textContent = "Don't have an account?";
    switchBtn.textContent = 'Sign up free';
  }
}

// ===== Mobile menu =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

function closeMobileMenu() {
  if (!mobileMenuBtn || !navLinks) return;
  mobileMenuBtn.classList.remove('open');
  navLinks.classList.remove('open');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
  if (!document.getElementById('authModal')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      mobileMenuBtn.classList.add('open');
      navLinks.classList.add('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}

// ===== Common listeners =====
document.getElementById('authModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'authModal') closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMobileMenu();
  }
});

// Navbar scroll
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
});
