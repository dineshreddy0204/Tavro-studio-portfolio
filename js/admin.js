/**
 * TAVRO STUDIO — Admin Control Portal Client
 * Handles authentication, real-time inquiry management, project CRUD, and capabilities.
 */

(function () {
  'use strict';

  const TOKEN_KEY = 'tavro_admin_token';
  let authToken = localStorage.getItem(TOKEN_KEY) || '';
  let projectsCache = [];

  // DOM Elements
  const authWrapper = document.getElementById('authWrapper');
  const dashboardWrapper = document.getElementById('dashboardWrapper');
  const loginForm = document.getElementById('loginForm');
  const adminPassword = document.getElementById('adminPassword');
  const authError = document.getElementById('authError');
  const logoutBtn = document.getElementById('logoutBtn');

  // Tabs & Navigation
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const currentTabTitle = document.getElementById('currentTabTitle');

  // Badges
  const inquiriesCount = document.getElementById('inquiriesCount');
  const projectsCount = document.getElementById('projectsCount');

  // Inquiries Elements
  const inquiriesTableBody = document.getElementById('inquiriesTableBody');

  // Projects Elements
  const projectsList = document.getElementById('projectsList');
  const btnOpenNewProject = document.getElementById('btnOpenNewProject');
  const projectModal = document.getElementById('projectModal');
  const btnCloseProjectModal = document.getElementById('btnCloseProjectModal');
  const btnCancelProject = document.getElementById('btnCancelProject');
  const projectForm = document.getElementById('projectForm');
  const projectModalTitle = document.getElementById('projectModalTitle');

  // Form inputs
  const projId = document.getElementById('projId');
  const projName = document.getElementById('projName');
  const projCategory = document.getElementById('projCategory');
  const projLiveUrl = document.getElementById('projLiveUrl');
  const projStatus = document.getElementById('projStatus');
  const projTagline = document.getElementById('projTagline');
  const projDesc = document.getElementById('projDesc');
  const projTech = document.getElementById('projTech');

  // Services Elements
  const servicesList = document.getElementById('servicesList');

  // =========================================================
  // API HELPER
  // =========================================================
  async function apiFetch(endpoint, options = {}) {
    const headers = Object.assign({
      'Content-Type': 'application/json'
    }, options.headers || {});

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(endpoint, Object.assign({}, options, { headers }));
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // =========================================================
  // AUTHENTICATION
  // =========================================================
  async function checkSession() {
    if (!authToken) {
      showAuthScreen();
      return;
    }

    try {
      const res = await apiFetch('/api/auth/verify');
      if (res.ok && res.data.authenticated) {
        showDashboard();
      } else {
        localStorage.removeItem(TOKEN_KEY);
        authToken = '';
        showAuthScreen();
      }
    } catch {
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    authWrapper.style.display = 'flex';
    dashboardWrapper.style.display = 'none';
  }

  function showDashboard() {
    authWrapper.style.display = 'none';
    dashboardWrapper.style.display = 'grid';
    loadInquiries();
    loadProjects();
    loadServices();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none';
    const password = adminPassword.value.trim();

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });

      if (res.ok && res.data.token) {
        authToken = res.data.token;
        localStorage.setItem(TOKEN_KEY, authToken);
        adminPassword.value = '';
        showDashboard();
      } else {
        authError.textContent = res.data.error || 'Authentication rejected. Verify your master key.';
        authError.style.display = 'block';
      }
    } catch (err) {
      authError.textContent = 'Server connection error. Ensure backend is running.';
      authError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    authToken = '';
    showAuthScreen();
  });

  // =========================================================
  // TAB NAVIGATION
  // =========================================================
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = document.getElementById(`tab-${tab}`);
      if (targetPane) targetPane.classList.add('active');

      const titles = {
        inquiries: 'Client Inquiries',
        projects: 'Portfolio Showcase Management',
        services: 'Agency Capabilities',
        deployment: 'Hostinger Production Deployment'
      };
      if (currentTabTitle) currentTabTitle.textContent = titles[tab] || 'Control Portal';
    });
  });

  // =========================================================
  // INQUIRIES MANAGEMENT
  // =========================================================
  async function loadInquiries() {
    try {
      const res = await apiFetch('/api/admin/inquiries');
      if (res.ok && Array.isArray(res.data)) {
        inquiriesCount.textContent = res.data.length;
        renderInquiries(res.data);
      }
    } catch (e) {
      console.error('Failed to load inquiries:', e);
    }
  }

  function renderInquiries(list) {
    if (!list.length) {
      inquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center empty-state">No client inquiries registered yet. Contact form submissions will appear here automatically.</td>
        </tr>
      `;
      return;
    }

    inquiriesTableBody.innerHTML = list.map(inq => {
      const date = new Date(inq.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const waClean = (inq.whatsapp || '').replace(/[^0-9]/g, '');
      const waLink = waClean ? `<a href="https://wa.me/${waClean}" target="_blank" rel="noopener noreferrer" class="contact-link wa">WA: ${escapeHTML(inq.whatsapp)}</a>` : '';

      return `
        <tr data-id="${inq.id}">
          <td class="mono-date">${date}</td>
          <td><strong>${escapeHTML(inq.name)}</strong></td>
          <td>${escapeHTML(inq.brand || '—')}</td>
          <td>
            <a href="mailto:${escapeHTML(inq.email)}" class="contact-link">${escapeHTML(inq.email)}</a>
            ${waLink}
          </td>
          <td><span class="badge badge-type">${escapeHTML(inq.projectType || 'General')}</span></td>
          <td class="mono-budget">${escapeHTML(inq.budget || 'To discuss on call')}</td>
          <td class="desc-cell" title="${escapeHTML(inq.description)}">${escapeHTML(inq.description)}</td>
          <td>
            <button class="btn-action-delete" onclick="window.tavroDeleteInquiry('${inq.id}')" title="Delete Inquiry">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.tavroDeleteInquiry = async function (id) {
    if (!confirm('Permanently delete this inquiry record?')) return;
    try {
      const res = await apiFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadInquiries();
      } else {
        alert(res.data.error || 'Failed to delete inquiry');
      }
    } catch (err) {
      alert('Network error while deleting inquiry');
    }
  };

  // =========================================================
  // PROJECTS MANAGEMENT
  // =========================================================
  async function loadProjects() {
    try {
      const res = await apiFetch('/api/projects');
      if (res.ok && Array.isArray(res.data)) {
        projectsCache = res.data;
        projectsCount.textContent = projectsCache.length;
        renderProjects(projectsCache);
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  }

  function renderProjects(list) {
    if (!list.length) {
      projectsList.innerHTML = `<div class="empty-state">No portfolio projects configured yet. Click "Add New Project" to create one.</div>`;
      return;
    }

    projectsList.innerHTML = list.map(proj => {
      const liveBadge = proj.liveUrl
        ? `<a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-live">Live: ${proj.liveUrl} ↗</a>`
        : `<span class="badge badge-pending">${escapeHTML(proj.status || 'Pending Launch')}</span>`;

      const techList = (proj.technologies || []).map(t => `<span class="pill">${escapeHTML(t)}</span>`).join('');

      return `
        <div class="project-admin-card" data-id="${proj.id}">
          <div class="card-top">
            <span class="proj-num">${escapeHTML(proj.num || '01')}</span>
            <div class="card-status">${liveBadge}</div>
          </div>
          <h4 class="proj-name">${escapeHTML(proj.name)}</h4>
          <span class="proj-cat">${escapeHTML(proj.category)}</span>
          <p class="proj-desc">${escapeHTML(proj.description)}</p>
          <div class="proj-tech">${techList}</div>
          <div class="card-actions">
            <button class="btn-sm btn-ghost" onclick="window.tavroEditProject('${proj.id}')">Edit Details</button>
            <button class="btn-sm btn-danger" onclick="window.tavroDeleteProject('${proj.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Add / Edit Modal Controls
  btnOpenNewProject.addEventListener('click', () => {
    projectForm.reset();
    projId.value = '';
    projectModalTitle.textContent = 'Add New Client Project';
    projectModal.style.display = 'flex';
  });

  function closeProjectModal() {
    projectModal.style.display = 'none';
  }

  btnCloseProjectModal.addEventListener('click', closeProjectModal);
  btnCancelProject.addEventListener('click', closeProjectModal);

  window.tavroEditProject = function (id) {
    const proj = projectsCache.find(p => p.id === id);
    if (!proj) return;

    projId.value = proj.id;
    projName.value = proj.name || '';
    projCategory.value = proj.category || '';
    projLiveUrl.value = proj.liveUrl || '';
    projStatus.value = proj.status || 'Live';
    projTagline.value = proj.tagline || '';
    projDesc.value = proj.description || '';
    projTech.value = (proj.technologies || []).join(', ');

    projectModalTitle.textContent = `Edit Project: ${proj.name}`;
    projectModal.style.display = 'flex';
  };

  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const techArray = projTech.value.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      name: projName.value.trim(),
      category: projCategory.value.trim(),
      liveUrl: projLiveUrl.value.trim(),
      status: projStatus.value,
      tagline: projTagline.value.trim(),
      description: projDesc.value.trim(),
      technologies: techArray
    };

    const id = projId.value;
    try {
      let res;
      if (id) {
        res = await apiFetch(`/api/admin/projects/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        closeProjectModal();
        loadProjects();
      } else {
        alert(res.data.error || 'Failed to save project');
      }
    } catch (err) {
      alert('Network error while saving project');
    }
  });

  window.tavroDeleteProject = async function (id) {
    if (!confirm('Are you sure you want to remove this project from your live portfolio?')) return;
    try {
      const res = await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProjects();
      } else {
        alert(res.data.error || 'Failed to remove project');
      }
    } catch (err) {
      alert('Network error while removing project');
    }
  };

  // =========================================================
  // SERVICES TAB
  // =========================================================
  async function loadServices() {
    try {
      const res = await apiFetch('/api/services');
      if (res.ok && Array.isArray(res.data)) {
        renderServices(res.data);
      }
    } catch (e) {
      console.error('Failed to load services:', e);
    }
  }

  function renderServices(list) {
    servicesList.innerHTML = list.map(svc => `
      <div class="service-admin-card">
        <span class="svc-num">${escapeHTML(svc.num)}</span>
        <h4>${escapeHTML(svc.name)}</h4>
        <p>${escapeHTML(svc.description)}</p>
        <ul class="deliverables-list">
          ${(svc.deliverables || []).map(d => `<li>✓ ${escapeHTML(d)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // Helper
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialize
  checkSession();
})();

