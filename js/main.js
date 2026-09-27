/**
 * MOHIT — Master Application Controller
 * Handles Navigation, Custom Cursor, Preloader, Photo Frame Upload,
 * Skill Filtering, Modals, Contact Form, IST Clock, and Toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ===================================================================
  // 1. PRELOADER SEQUENCE
  // ===================================================================
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.querySelector('.preloader-bar');
  const preloaderCounter = document.querySelector('.preloader-counter');

  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 20) + 12;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(loadInterval);

      if (preloaderBar) preloaderBar.style.width = '100%';
      if (preloaderCounter) preloaderCounter.textContent = '100%';

      setTimeout(() => {
        if (preloader) preloader.classList.add('loaded');
      }, 350);
    } else {
      if (preloaderBar) preloaderBar.style.width = `${loadProgress}%`;
      if (preloaderCounter) preloaderCounter.textContent = `${loadProgress}%`;
    }
  }, 75);

  // ===================================================================
  // 2. CUSTOM CURSOR SYSTEM
  // ===================================================================
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Hover detection for links & buttons
    document.querySelectorAll('a, button, .clickable, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });

    // Special Project Card Hover: "EXPLORE" Mode
    document.querySelectorAll('.project-card-featured, .project-card-sub').forEach(card => {
      card.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-project'));
      card.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-project'));
    });
  }

  // ===================================================================
  // 3. FLOATING NAVBAR & SCROLL SPY
  // ===================================================================
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Navbar compact mode
    if (scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Active Section Spy
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 180;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });

  // Mobile Menu Drawer
  const hamburgerBtn = document.getElementById('nav-hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===================================================================
  // 4. HERO PHOTO FRAME: DRAG-AND-DROP / UPLOAD PERSISTENCE
  // ===================================================================
  const photoDisplay = document.getElementById('photo-display-target');
  const photoFileInput = document.getElementById('photo-file-input');
  const photoImg = document.getElementById('photo-display-img');
  const photoPlaceholderUI = document.querySelector('.photo-placeholder-ui');
  const photoUploadBtn = document.getElementById('btn-upload-photo');

  // Check LocalStorage for previously saved custom photo
  const savedPhoto = localStorage.getItem('mohit_portfolio_avatar');
  if (savedPhoto && photoImg && photoPlaceholderUI) {
    photoImg.src = savedPhoto;
    photoImg.classList.add('active');
    photoPlaceholderUI.style.opacity = '0';
  }

  function handlePhotoUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      if (photoImg && photoPlaceholderUI) {
        photoImg.src = result;
        photoImg.classList.add('active');
        photoPlaceholderUI.style.opacity = '0';
        try {
          localStorage.setItem('mohit_portfolio_avatar', result);
          showToast('Profile photo updated successfully!');
          if (window.SoundSystem) window.SoundSystem.success();
        } catch (err) {
          showToast('Photo loaded (Note: Image was too large for browser storage)');
        }
      }
    };
    reader.readAsDataURL(file);
  }

  if (photoUploadBtn && photoFileInput) {
    photoUploadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      photoFileInput.click();
    });
  }

  if (photoDisplay && photoFileInput) {
    photoDisplay.addEventListener('click', () => {
      photoFileInput.click();
    });

    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoUpload(e.target.files[0]);
      }
    });

    // Drag and Drop
    photoDisplay.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoDisplay.style.borderColor = 'var(--red-accent)';
    });

    photoDisplay.addEventListener('dragleave', (e) => {
      e.preventDefault();
      photoDisplay.style.borderColor = '';
    });

    photoDisplay.addEventListener('drop', (e) => {
      e.preventDefault();
      photoDisplay.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePhotoUpload(e.dataTransfer.files[0]);
      }
    });
  }

  // ===================================================================
  // 5. SKILLS FILTERING
  // ===================================================================
  const skillFilterBtns = document.querySelectorAll('.skills-filter-nav .filter-btn');
  const skillCards = document.querySelectorAll('.skills-grid .skill-card');

  skillFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ===================================================================
  // 6. COPY EMAIL SYSTEM & TOASTS
  // ===================================================================
  const copyEmailBtns = document.querySelectorAll('.btn-copy-email');
  copyEmailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email') || 'mohitpareek.dev@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`);
        if (window.SoundSystem) window.SoundSystem.success();
      }).catch(() => {
        showToast(`Email: ${email}`);
      });
    });
  });

  window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  // ===================================================================
  // 7. CONTACT FORM HANDLER (Directs to mohitpareek.dev@gmail.com)
  // ===================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const name = document.getElementById('contact-name')?.value || '';
      const email = document.getElementById('contact-email')?.value || '';
      const topic = document.getElementById('contact-topic')?.value || 'General Inquiry';
      const message = document.getElementById('contact-message')?.value || '';

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Opening Mail Client...</span>`;

      // Construct mailto link
      const subject = encodeURIComponent(`[Portfolio Inquiry - ${topic}] from ${name}`);
      const body = encodeURIComponent(`Hello Mohit,\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}\n`);
      const mailtoUrl = `mailto:mohitpareek.dev@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoUrl;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showToast('Email client opened with prefilled message to mohitpareek.dev@gmail.com!');
        if (window.SoundSystem) window.SoundSystem.success();
      }, 1000);
    });
  }

  // ===================================================================
  // 7B. DYNAMIC GITHUB REPOSITORIES (Only Real Data for @mohit-dev-max)
  // ===================================================================
  async function fetchRealGitHubRepos() {
    const reposContainer = document.getElementById('github-real-repos');
    if (!reposContainer) return;

    try {
      const response = await fetch('https://api.github.com/users/mohit-dev-max/repos?sort=updated', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (response.ok) {
        const repos = await response.json();
        if (Array.isArray(repos) && repos.length > 0) {
          reposContainer.innerHTML = '';
          repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'repo-card';
            card.innerHTML = `
              <div>
                <div class="repo-card-top">
                  <span class="repo-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    ${repo.name}
                  </span>
                  <span style="font-size:0.7rem; color:var(--text-dim); border:1px solid var(--border-color); padding:0.15rem 0.45rem; border-radius:4px;">Public</span>
                </div>
                <p class="repo-desc">${repo.description || 'Personal project and developer repository.'}</p>
              </div>
              <div class="repo-meta" style="margin-top: 1rem;">
                <span class="repo-lang-tag"><span class="lang-circle" style="background: var(--red-accent);"></span> ${repo.language || 'Web / Code'}</span>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color:var(--text-white); font-weight:600; font-size:0.78rem;">
                  GitHub ↗
                </a>
              </div>
            `;
            reposContainer.appendChild(card);
          });
        }
      }
    } catch (err) {
      // Fallback already pre-rendered statically in HTML
      console.log('GitHub API offline or rate-limited; verified static fallback is active.');
    }
  }
  fetchRealGitHubRepos();

  // ===================================================================
  // 8. RESUME MODAL SYSTEM
  // ===================================================================
  const resumeModalBackdrop = document.getElementById('resume-modal-backdrop');
  const openResumeBtns = document.querySelectorAll('.btn-open-resume');
  const closeResumeBtn = document.getElementById('btn-close-resume');

  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (resumeModalBackdrop) resumeModalBackdrop.classList.add('open');
    });
  });

  if (closeResumeBtn && resumeModalBackdrop) {
    closeResumeBtn.addEventListener('click', () => {
      resumeModalBackdrop.classList.remove('open');
    });

    resumeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === resumeModalBackdrop) {
        resumeModalBackdrop.classList.remove('open');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModalBackdrop?.classList.contains('open')) {
      resumeModalBackdrop.classList.remove('open');
    }
  });

  // ===================================================================
  // 9. LIVE FOOTER CLOCK (IST - Indian Standard Time)
  // ===================================================================
  const clockElement = document.getElementById('footer-live-time');
  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    // Format in IST
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockElement.textContent = `${now.toLocaleTimeString('en-IN', options)} IST`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ===================================================================
  // 10. BACK TO TOP
  // ===================================================================
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
