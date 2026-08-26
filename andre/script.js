/**
 * Interatividade do Currículo - André Souza
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSkillFilters();
  initCopyActions();
});

/* Theme Toggle (Dark / Light) */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(`Tema ${newTheme === 'light' ? 'Claro' : 'Escuro'} ativado`);
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeIcon) {
        // Sun to Moon
        themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeIcon) {
        // Moon to Sun
        themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      }
    }
  }
}

/* Skills Category Filter */
function initSkillFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillCategories = document.querySelectorAll('.skill-category-block');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCategories.forEach(cat => {
        if (filter === 'all' || cat.getAttribute('data-category') === filter) {
          cat.style.display = 'block';
          cat.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          cat.style.display = 'none';
        }
      });
    });
  });
}

/* Copy to Clipboard Actions & Print Trigger */
function initCopyActions() {
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const printBtn = document.getElementById('print-btn');

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'contato@andresouza.dev';
      navigator.clipboard.writeText(email).then(() => {
        showToast('✉️ Email copiado para a área de transferência!');
      }).catch(() => {
        showToast('Email: contato@andresouza.dev');
      });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* Toast Notifications */
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
