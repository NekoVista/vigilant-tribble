// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

function closeMobileMenu() {
  mobileMenuBtn.classList.remove('open');
  navLinks.classList.remove('open');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

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

// Close mobile menu when clicking a nav link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    
    // Open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

// Auth modal
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

// Close modal on overlay click
document.getElementById('authModal').addEventListener('click', (e) => {
  if (e.target.id === 'authModal') closeModal();
});

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMobileMenu();
  }
});

// Form submit (simulated)
function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  
  closeModal();
  
  if (isSignup) {
    showToast(`Welcome to EmuioHost! Account created for ${email}`);
  } else {
    showToast(`Logged in as ${email}`);
  }
  
  // Reset form
  document.getElementById('authForm').reset();
}

function simulateOAuth() {
  closeModal();
  showToast('Connected with GitHub! Welcome to EmuioHost.');
}

// Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
