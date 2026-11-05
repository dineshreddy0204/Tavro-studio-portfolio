/**
 * TAVRO STUDIO — Admin Control Portal Client
 * Supports BOTH:
 *  1. Production Server Mode (Node.js API / Hostinger)
 *  2. Direct Chrome Standalone Mode (Opens via file:/// or cloud without needing localhost server!)
 */

(function () {
  'use strict';

  const TOKEN_KEY = 'tavro_admin_token';
  const VALID_KEYS = ['dineshreddy@02', 'tavro2026'];
  let authToken = localStorage.getItem(TOKEN_KEY) || '';
  let projectsCache = [];

  const DEFAULT_PROJECTS = [
    {
      id: "dazzlinglooks",
      num: "01",
      name: "Dazzlinglooks",
      category: "Beauty E-commerce",
      tagline: "High-Conversion Luxury Beauty Flagship",
      description: "Premium beauty e-commerce website engineered for an emerging luxury cosmetics brand. Focused on fluid product discovery, interactive shade matching, high-speed mobile checkout, and editorial brand storytelling.",
      liveUrl: "https://www.dazzlinglooks.in/",
      status: "Live",
      services: [
        "Strategic Website Design & Development",
        "E-commerce Development",
        "UI/UX Design",
        "Conversion Rate Optimization"
      ],
      technologies: [
        "Shopify Plus / Hydrogen",
        "Next.js",
        "Tailwind CSS",
        "WebGL",
        "Framer Motion"
      ],
      year: "2026",
      accentColor: "#c5a880"
    }
  ];

  const DEFAULT_SERVICES = [
    { num: "01", name: "Strategic Website Design & Development", description: "Bespoke digital platforms, corporate websites, and interactive brand hubs engineered from scratch.", deliverables: ["Custom Frontend & Backend Architecture", "60fps Motion Choreography", "Semantic SEO Optimization", "Sub-Second Core Web Vitals"] },
    { num: "02", name: "E-commerce Development", description: "Scalable, high-conversion online stores tailored to your business model.", deliverables: ["Shopify Plus & Headless Storefronts", "Frictionless Cart Drawers & One-Page Checkout", "Global Multi-Currency & Automated Tax Setup", "Inventory & ERP System Integrations"] },
    { num: "03", name: "UI/UX Design", description: "Research-backed user experience and visually arresting user interfaces.", deliverables: ["Comprehensive Design Systems & Tokens", "Interactive Wireframing & Prototyping", "User Journey & Conversion Funnel Audits", "Micro-Interactions & Visual Guidelines"] },
    { num: "04", name: "Business Websites", description: "High-credibility corporate and commercial web platforms built to command authority.", deliverables: ["Brand Authority Presentation", "Lead Capture & CRM Integrations", "Interactive Case Studies & Portfolios", "Enterprise Grade Security & Compliance"] },
    { num: "05", name: "Landing Page Development", description: "High-velocity campaign and product landing pages engineered specifically for paid acquisition.", deliverables: ["A/B Testing Architecture", "Lightning Fast Mobile Load Speeds", "Persuasive Editorial Storytelling", "Direct Attribution & Pixel Tracking"] },
    { num: "06", name: "Web Application Development", description: "Modern full-stack web applications, portals, and software platforms.", deliverables: ["Next.js / React Full-Stack Architecture", "Secure Role-Based Authentication & Permissions", "Real-Time Database & Cloud Storage", "RESTful & GraphQL API Endpoints"] },
    { num: "07", name: "Website Maintenance", description: "Proactive 24/7 technical monitoring, security patching, and speed optimization.", deliverables: ["Continuous Core Web Vitals Audits", "Security Patches & Vulnerability Scanning", "Daily Automated Cloud Backups", "Priority SLA Feature Updates"] },
    { num: "08", name: "Custom Digital Solutions", description: "Tailored digital engineering to solve complex operational challenges.", deliverables: ["Custom Workflow Automation", "Third-Party API & Webhook Integrations", "Headless CMS & Custom Admin Dashboards", "Custom Analytics & Reporting Infrastructure"] }
  ];

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
  const statusIndicator = document.querySelector('.topbar-status .status-text');

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

    if (authToken && !authToken.startsWith('local_')) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(endpoint, Object.assign({}, options, { headers }));
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  function setStatus(text, isOnline = true) {
    if (statusIndicator) {
      statusIndicator.textContent = text;
      const pulse = document.querySelector('.topbar-status .pulse-indicator');
      if (pulse) pulse.style.background = isOnline ? '#27c93f' : '#c5a880';
    }
  }

  // =========================================================
  // AUTHENTICATION
  // =========================================================
  async function checkSession() {
    if (!authToken) {
      showAuthScreen();
      return;
    }

    if (authToken.startsWith('local_')) {
      showDashboard();
      setStatus('Direct Standalone Mode (Zero Server Needed)', false);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/verify');
      if (res.ok && res.data.authenticated) {
        showDashboard();
        setStatus('Production Server Connected', true);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        authToken = '';
        showAuthScreen();
      }
    } catch {
      // If server unreachable, still allow view if session was authenticated
      showDashboard();
      setStatus('Direct Standalone Mode (Zero Server Needed)', false);
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

    let authenticated = false;

    // 1. Try server login if not file: protocol
    if (window.location.protocol !== 'file:') {
      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ password })
        });

        if (res.ok && res.data.token) {
          authToken = res.data.token;
          localStorage.setItem(TOKEN_KEY, authToken);
          authenticated = true;
          setStatus('Production Server Connected', true);
        }
      } catch (err) {
        // server offline, proceed to master key check
      }
    }

    // 2. Direct Standalone Master Key Authentication (Zero Server Needed!)
    if (!authenticated) {
      if (VALID_KEYS.includes(password)) {
        authToken = 'local_' + Date.now();
        localStorage.setItem(TOKEN_KEY, authToken);
        authenticated = true;
        setStatus('Direct Standalone Mode (Zero Server Needed)', false);
      }
    }

    if (authenticated) {
      adminPassword.value = '';
      showDashboard();
    } else {
      authError.textContent = 'Invalid Master Security Key. Please verify your password.';
      authError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
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
        deployment: 'Hostinger & Cloud Deployment'
      };
      if (currentTabTitle) currentTabTitle.textContent = titles[tab] || 'Control Portal';
    });
  });

  // =========================================================
  // INQUIRIES MANAGEMENT
  // =========================================================
  async function loadInquiries() {
    let list = [];

    // Try server API first
    if (window.location.protocol !== 'file:') {
      try {
        const res = await apiFetch('/api/admin/inquiries');
        if (res.ok && Array.isArray(res.data)) {
          list = res.data;
        }
      } catch (e) {}
    }

    // Merge with browser LocalStorage inquiries
    try {
      const localInqs = JSON.parse(localStorage.getItem('tavro_inquiries_db') || '[]');
      const ids = new Set(list.map(i => i.id));
      for (const item of localInqs) {
        if (!ids.has(item.id)) list.push(item);
      }
    } catch (e) {}

    inquiriesCount.textContent = list.length;
    renderInquiries(list);
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
      await apiFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    } catch (err) {}

    try {
      let localInqs = JSON.parse(localStorage.getItem('tavro_inquiries_db') || '[]');
      localInqs = localInqs.filter(i => i.id !== id);
      localStorage.setItem('tavro_inquiries_db', JSON.stringify(localInqs));
    } catch (err) {}

    loadInquiries();
  };

  // =========================================================
  // PROJECTS MANAGEMENT
  // =========================================================
  async function loadProjects() {
    let list = [];

    if (window.location.protocol !== 'file:') {
      try {
        const res = await apiFetch('/api/projects');
        if (res.ok && Array.isArray(res.data) && res.data.length) {
          list = res.data;
        }
      } catch (e) {}
    }

    if (!list.length) {
      try {
        const saved = JSON.parse(localStorage.getItem('tavro_projects_db') || '[]');
        if (saved.length) list = saved;
      } catch (e) {}
    }

    if (!list.length) {
      list = DEFAULT_PROJECTS;
    }

    projectsCache = list;
    projectsCount.textContent = projectsCache.length;
    renderProjects(projectsCache);
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

    // 1. Try server update
    if (window.location.protocol !== 'file:') {
      try {
        if (id) {
          await apiFetch(`/api/admin/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        } else {
          await apiFetch('/api/admin/projects', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {}
    }

    // 2. Update LocalStorage cache
    try {
      let saved = JSON.parse(localStorage.getItem('tavro_projects_db') || '[]');
      if (!saved.length) saved = DEFAULT_PROJECTS.slice();

      if (id) {
        const idx = saved.findIndex(p => p.id === id);
        if (idx !== -1) {
          saved[idx] = Object.assign({}, saved[idx], payload);
        }
      } else {
        const newP = Object.assign({
          id: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          num: String(saved.length + 1).padStart(2, '0')
        }, payload);
        saved.push(newP);
      }
      localStorage.setItem('tavro_projects_db', JSON.stringify(saved));
    } catch (e) {}

    closeProjectModal();
    loadProjects();
  });

  window.tavroDeleteProject = async function (id) {
    if (!confirm('Are you sure you want to remove this project from your live portfolio?')) return;

    if (window.location.protocol !== 'file:') {
      try {
        await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      } catch (err) {}
    }

    try {
      let saved = JSON.parse(localStorage.getItem('tavro_projects_db') || '[]');
      saved = saved.filter(p => p.id !== id);
      localStorage.setItem('tavro_projects_db', JSON.stringify(saved));
    } catch (err) {}

    loadProjects();
  };

  // =========================================================
  // SERVICES TAB
  // =========================================================
  async function loadServices() {
    let list = [];
    if (window.location.protocol !== 'file:') {
      try {
        const res = await apiFetch('/api/services');
        if (res.ok && Array.isArray(res.data) && res.data.length) {
          list = res.data;
        }
      } catch (e) {}
    }

    if (!list.length) list = DEFAULT_SERVICES;
    renderServices(list);
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
