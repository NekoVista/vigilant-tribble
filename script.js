// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyDIjF0VPC5iCBiGEHeBlDHUgUv21-eHMoM",
  authDomain: "emuiohost.firebaseapp.com",
  projectId: "emuiohost",
  storageBucket: "emuiohost.firebasestorage.app",
  messagingSenderId: "1007646868538",
  appId: "1:1007646868538:web:de65e8bb0791e9e7f2a103",
  measurementId: "G-JKTE8X02VX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== UI helpers =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

function updateNavAuth(user) {
  const navActions = document.querySelector('.nav-actions');
  const mobileActions = document.querySelector('.mobile-nav-actions');
  if (!navActions) return;

  if (user) {
    const email = user.email || 'User';
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
let isSignup = true;

function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const submitBtn = document.getElementById('submitBtn');

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = isSignup ? 'Creating account…' : 'Logging in…';

  const action = isSignup
    ? auth.createUserWithEmailAndPassword(email, password)
    : auth.signInWithEmailAndPassword(email, password);

  action
    .then((userCredential) => {
      closeModal();
      document.getElementById('authForm').reset();
      showToast(isSignup ? 'Account created! Welcome to EmuioHost.' : 'Welcome back!');
    })
    .catch((error) => {
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Try logging in.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (error.code === 'auth/weak-password') msg = 'Password is too weak.';
      if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
      showToast(msg, 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      updateModalUI();
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      showToast('Logged out successfully');
      if (window.location.pathname.includes('dashboard')) {
        window.location.href = 'index.html';
      }
    })
    .catch(() => showToast('Error logging out', 'error'));
}

function simulateOAuth() {
  // GitHub OAuth requires extra Firebase setup (provider + authorized domains)
  // For now show a helpful message
  showToast('GitHub login needs extra setup in Firebase Console → Authentication → Sign-in method → GitHub', 'error');
}

// ===== Modal =====
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

// ===== Auth state listener =====
auth.onAuthStateChanged((user) => {
  updateNavAuth(user);
});
