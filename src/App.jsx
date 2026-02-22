import { useState, useEffect, useCallback } from 'react';
import './index.css';
import {
  LayoutGrid, List, RefreshCw, Settings, Search, Github,
  X, ChevronDown, Plus, FolderOpen, Download, Upload, Sparkles,
  Monitor, Smartphone, Cloud, Users, Globe, Lock, Terminal
} from 'lucide-react';
import * as storage from './services/storageService';
import * as githubService from './services/githubService';
import * as syncService from './services/syncService';
import {
  DEFAULT_PROJECT_TYPES, DEFAULT_CAPABILITIES,
  VIEW_MODES, GROUP_COLORS, DEFAULT_STATUSES, STATIC_GITHUB_TOKEN
} from './utils/constants';
import ProjectCard from './components/ProjectCard';
import ProjectRow from './components/ProjectRow';
import ProjectModal from './components/ProjectModal';
import SettingsView from './components/SettingsView';
import NewReposBanner from './components/NewReposBanner';
import StatusColumn from './components/StatusColumn';
import Login from './components/Login';

import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const WikiModal = ({ onClose }) => {
  const list = [
    { icon: <Monitor size={20} />, label: 'PC', desc: 'Diseñado para escritorio' },
    { icon: <Smartphone size={20} />, label: 'Responsive', desc: 'Adaptable a móviles' },
    { icon: <div style={{ fontSize: 14, fontWeight: 700 }}>AND</div>, label: 'Android', desc: 'App nativa Android' },
    { icon: <div style={{ fontSize: 14, fontWeight: 700 }}>iOS</div>, label: 'iOS', desc: 'App nativa iOS' },
    { icon: <Cloud size={20} />, label: 'Vercel', desc: 'Desplegado en Vercel/Cloud' },
    { icon: <Users size={20} />, label: 'Multiusuario', desc: 'Soporte para múltiples usuarios' },
    { icon: <Globe size={20} />, label: 'Público', desc: 'Accesible públicamente' },
    { icon: <Terminal size={20} />, label: 'Agent-friendly', desc: 'Backend Only / Apto para agentes' },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">Leyenda de Iconos</div>
          <button className="btn btn--ghost btn--icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal__body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 32, display: 'flex', justifyContent: 'center', color: 'var(--text-primary)' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MIGRATION_DATA = {
  'agent-market': {
    description: "Marketplace d'agents d'IA de nova generació.",
    check_agent: true, check_vercel: true, check_publico: true, check_responsive: true
  },
  'app_boe': {
    description: "Visor del Butlletí Oficial de l'Estat en format mòbil.",
    check_android: true, check_responsive: true
  },
  'app_crono': {
    description: "Aplicació de cronometratge esportiu precís.",
    check_android: true, check_responsive: true
  },
  'app_lol': {
    description: "Utilitats i estadístiques per a League of Legends.",
    check_pc: true
  },
  'botifarra': {
    description: "Joc de cartes tradicional català multijugador.",
    check_responsive: true, check_multiusuario: true
  },
  'buytrack-pcconfig': {
    description: "Seguiment de preus de components de PC.",
    check_responsive: true, check_pc: true
  },
  'closet-app': {
    description: "Gestor d'armari i outfits intel·ligent.",
    check_responsive: true, check_ios: true
  },
  'devdash': {
    description: "Dashboard local per a desenvolupadors.",
    check_pc: true, check_agent: true
  },
  'drp ia intern': {
    description: "Projecte intern d'IA per a DRP.",
    check_agent: true, check_pc: true
  },
  'estalvi-app': {
    description: "Aplicació de gestió d'estalvi compartit.",
    check_responsive: true, check_multiusuario: true, check_vercel: true
  },
  'google-fit-uploader': {
    description: "Eina per pujar dades a Google Fit.",
    check_pc: true
  },
  'homeassistant': {
    description: "Configuració de domòtica avançada amb Home Assistant.",
    check_pc: true, check_responsive: true
  },
  'led-control-raspi': {
    description: "Control de LEDs amb Raspberry Pi.",
    check_pc: true
  },
  'marc-oliva-portfolio': {
    description: "Portfoli personal professional.",
    check_responsive: true, check_vercel: true
  },
  'metroflog-app': {
    description: "Rèplica de la xarxa social Metroflog.",
    check_responsive: true
  },
  'predict_demanda': {
    description: "Algorismes de predicció de demanda.",
    check_pc: true, check_agent: true
  },
  'rp-pddl': {
    description: "Planificació automàtica amb PDDL.",
    check_agent: true, check_pc: true
  },
  'series temporals temp ( va fatal )': {
    description: "Anàlisi de sèries temporals.",
    check_pc: true
  },
  'simpsons': {
    description: "Web de fans dels Simpson.",
    check_responsive: true
  },
  'spotifyplayer': {
    description: "Reproductor web de Spotify personalitzat.",
    check_responsive: true, check_vercel: true
  },
  'stripe-test': {
    description: "Integració de proves amb Stripe.",
    check_pc: true
  },
  'task_game': {
    description: "Gamificació de tasques diàries.",
    check_responsive: true
  },
  'violiva_web': {
    description: "Web corporativa de Violiva.",
    check_responsive: true
  },
  'wavelength-catalan': {
    description: "Joc de taula Wavelength en català.",
    check_responsive: true, check_multiusuario: true, check_vercel: true
  }
};

function App() {
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODES.CARDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    projectType: null, parentId: null, tag: null,
    // Boolean filters (null = ignore, true = must have)
    check_pc: null, check_responsive: null, check_android: null, check_ios: null,
    check_vercel: null, check_multiusuario: null, check_agent: null
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showWiki, setShowWiki] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newRepos, setNewRepos] = useState([]);
  const [githubToken, setGithubToken] = useState(STATIC_GITHUB_TOKEN || '');
  const [githubUsername, setGithubUsername] = useState('oli');
  const [localPath, setLocalPath] = useState('/Users/axblue/Desktop/Repositoris');
  const [initialized, setInitialized] = useState(false);

  // Auth State
  const [authToken, setAuthToken] = useState(localStorage.getItem('devdash_auth_token') || null);

  const handleLogin = (token) => {
    localStorage.setItem('devdash_auth_token', token);
    setAuthToken(token);
    githubService.initGitHub(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('devdash_auth_token');
    setAuthToken(null);
    window.location.reload();
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load data on mount
  useEffect(() => {
    async function init() {
      const savedProjects = await storage.getAllProjects();
      let savedStatuses = await storage.getAllStatuses();
      let savedCategories = await storage.getAllCategories();
      const savedToken = await storage.getAppState('githubToken');
      const savedUsername = await storage.getAppState('githubUsername');
      const savedLocalPath = await storage.getAppState('localPath');
      const savedViewMode = await storage.getAppState('viewMode');

      // Init default categories
      // Force update categories to new defaults (User requested update)
      const defaults = [...DEFAULT_PROJECT_TYPES, ...DEFAULT_CAPABILITIES];
      savedCategories = defaults;

      // Init default statuses if first run
      if (savedStatuses.length === 0) {
        for (const status of DEFAULT_STATUSES) {
          await storage.saveStatus(status);
        }
        savedStatuses = DEFAULT_STATUSES;
      } else {
        // Migration: Rename 'En proves' to 'En millores'
        const testingStatus = savedStatuses.find(s => s.id === 'status-testing');
        if (testingStatus && testingStatus.value === 'En proves') {
          testingStatus.value = 'En millores';
          await storage.saveStatus(testingStatus);
        }

        // Migration: Ensure 'Inicial' exists
        if (!savedStatuses.some(s => s.id === 'status-initial')) {
          const initialStatus = { id: 'status-initial', value: 'Inicial', color: '#bdc3c7', icon: '🏁' };
          await storage.saveStatus(initialStatus);
          savedStatuses.unshift(initialStatus);
        }

        // Migration: Remove 'Aturat' and move to 'Inicial'
        const standbyStatusIndex = savedStatuses.findIndex(s => s.id === 'status-standby');
        if (standbyStatusIndex !== -1) {
          await storage.deleteStatus('status-standby');
          savedStatuses.splice(standbyStatusIndex, 1);
        }
      }

      // Deduplication Logic
      const uniqueProjects = [];
      const projectsByName = {};

      // Sort by last modified or creation date descending to keep the most recent
      savedProjects.sort((a, b) => new Date(b.githubUpdatedAt || b.updatedAt || 0) - new Date(a.githubUpdatedAt || a.updatedAt || 0));

      for (const p of savedProjects) {
        const key = p.name.toLowerCase();
        if (!projectsByName[key]) {
          projectsByName[key] = p;
          uniqueProjects.push(p);
        } else {
          // Duplicate found - check which one to keep
          const existing = projectsByName[key];
          // If the current one (p) has github data and existing doesn't, swap (though sorting should handle this mostly)
          if (p.isOnGithub && !existing.isOnGithub) {
            // Remove existing from uniqueProjects
            const idx = uniqueProjects.indexOf(existing);
            if (idx !== -1) uniqueProjects[idx] = p;
            projectsByName[key] = p;
            // Delete the "existing" which is now the discarded one
            await storage.deleteProject(existing.id);
          } else {
            // Delete the duplicate
            await storage.deleteProject(p.id);
          }
        }
      }

      // Status Migration: null/'Sin estado' -> 'Inicial'
      for (const p of uniqueProjects) {
        let changed = false;
        if (!p.status || p.status === 'Sin estado' || p.status === 'Aturat') {
          p.status = 'Inicial';
          changed = true;
        }
        // Also ensure new schema fields exist
        const booleanFields = ['check_pc', 'check_responsive', 'check_android', 'check_ios', 'check_vercel', 'check_multiusuario'];
        for (const field of booleanFields) {
          // User requested ALL to be null. Force reset.
          // To allow saving later, we should probably check a flag, but since the user
          // explicitly asked for this NOW, I will just force it.
          // If I force it every time, they can't save. 
          // I will simply check if it's NOT NULL.
          // If they save it as true, next reload it will be null again?
          // Yes, unless I have a migration flag.
          // Given the constraints and the direct request "Ok ahora pon...", 
          // I will implement a one-time check based on a new property "migration_reset_done".
          if (!p.migration_reset_done) {
            p[field] = null;
            p.migration_reset_done = true; // Mark reset done
            changed = true;
          }
        }

        // MIGRATION V1: Description + Specific Booleans
        if (!p.migration_v1_desc) {
          const defaults = MIGRATION_DATA[p.name.toLowerCase()];
          if (defaults) {
            p.description = defaults.description;
            // Merge booleans if present in defaults
            for (const field of booleanFields) {
              if (defaults[field] !== undefined) {
                p[field] = defaults[field];
              }
            }
          }
          p.migration_v1_desc = true;
          changed = true;
        }

        // Remove old fields if present
        if (p.tags !== undefined) {
          delete p.tags;
          changed = true;
        }

        if (changed) {
          await storage.saveProject(p);
        }
      }

      setProjects(uniqueProjects.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      // Sort statuses according to DEFAULT_STATUSES position
      const statusOrder = DEFAULT_STATUSES.map(s => s.id);
      savedStatuses.sort((a, b) => {
        const indexA = statusOrder.indexOf(a.id);
        const indexB = statusOrder.indexOf(b.id);
        // If not found (old custom status?), put at end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      setStatuses(savedStatuses);
      setCategories(savedCategories);

      // Use static token first, then saved, then env
      const envToken = import.meta.env.VITE_GITHUB_TOKEN;
      const tokenToUse = STATIC_GITHUB_TOKEN || savedToken || envToken || '';
      const usernameToUse = savedUsername || 'oli';
      const pathToUse = savedLocalPath || '/Users/axblue/Desktop/Repositoris';

      if (tokenToUse) {
        setGithubToken(tokenToUse);
        githubService.initGitHub(tokenToUse);
      }
      if (savedUsername) setGithubUsername(savedUsername);
      if (savedLocalPath) setLocalPath(savedLocalPath);
      if (savedViewMode) setViewMode(savedViewMode);
      setInitialized(true);

      // Auto-sync in background if token is configured
      if (tokenToUse) {
        setSyncing(true);
        try {
          // Initialize with auth token if available
          if (authToken) {
            githubService.initGitHub(authToken);
          }

          const result = await syncService.syncGitHub(usernameToUse);
          setProjects(result.updatedProjects.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
          if (result.newRepos.length > 0) {
            setNewRepos(result.newRepos);
          }
          // Also sync local folder
          const localNew = await syncService.syncLocalFolder(pathToUse);
          if (localNew.length > 0) {
            const all = await storage.getAllProjects();
            setProjects(all.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
            setNewRepos(prev => [...prev, ...localNew.map(p => p.name)]);
          }
        } catch (err) {
          console.warn('Auto-sync on startup failed:', err.message);
        } finally {
          setSyncing(false);
        }
      }
    }
    init();
  }, []);

  // Save view mode preference
  useEffect(() => {
    if (initialized) {
      storage.setAppState('viewMode', viewMode);
    }
  }, [viewMode, initialized]);

  // Sync handler
  const handleSync = useCallback(async () => {
    if (!githubToken) {
      setShowSettings(true);
      return;
    }
    setSyncing(true);
    try {
      if (authToken) githubService.initGitHub(authToken);
      const result = await syncService.syncGitHub(githubUsername);
      setProjects(result.updatedProjects.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      if (result.newRepos.length > 0) {
        setNewRepos(result.newRepos);
      }

      // Also sync local folder
      const localNew = await syncService.syncLocalFolder(localPath);
      if (localNew.length > 0) {
        const all = await storage.getAllProjects();
        setProjects(all.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        setNewRepos(prev => [...prev, ...localNew.map(p => p.name)]);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [githubToken, githubUsername, localPath]);

  // Save project
  const handleSaveProject = useCallback(async (project) => {
    await storage.saveProject(project);
    const all = await storage.getAllProjects();
    setProjects(all.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    setSelectedProject(project);
  }, []);

  // Delete project
  const handleDeleteProject = useCallback(async (id) => {
    await storage.deleteProject(id);
    const all = await storage.getAllProjects();
    setProjects(all.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    setSelectedProject(null);
  }, []);

  // Drag over
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveProject = active.data.current?.type === 'Project';
    const isOverProject = over.data.current?.type === 'Project';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveProject) return;

    const activeProject = projects.find(p => p.id === activeId);
    if (!activeProject) return;

    // 1. Dropped over "Sin estado" container replacement (should not happen normally now, but if so map to Inicial)
    if (overId === 'status-none' || overId === 'status-initial') {
      if (activeProject.status !== 'Inicial') {
        setProjects(prev => prev.map(p => p.id === activeId ? { ...p, status: 'Inicial' } : p));
      }
      return;
    }

    // 2. Dropped over a Status Column container
    if (isOverColumn) {
      const overStatusValue = over.data.current.status?.value;
      if (activeProject.status !== overStatusValue) {
        setProjects(prev => prev.map(p => p.id === activeId ? { ...p, status: overStatusValue } : p));
      }
      return;
    }

    // 3. Dropped over another project
    if (isOverProject) {
      const overProject = projects.find(p => p.id === overId);
      if (overProject && activeProject.status !== overProject.status) {
        setProjects(prev => prev.map(p => p.id === activeId ? { ...p, status: overProject.status } : p));
      }
    }
  }, [projects]);

  const [isDragging, setIsDragging] = useState(false);

  // Drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    document.body.style.overflowX = 'hidden';
  }, []);

  // Drag end
  const handleDragEnd = useCallback(async (event) => {
    setIsDragging(false);
    document.body.style.overflowX = '';
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeProject = projects.find(p => p.id === activeId);

    if (!activeProject) return;

    // Persist current status
    let targetStatus = activeProject.status;

    if (overId === 'status-none' || overId === 'status-initial') {
      targetStatus = 'Inicial';
    } else if (over.data.current?.type === 'Column') {
      targetStatus = over.data.current.status?.value;
    } else if (over.data.current?.type === 'Project') {
      const overProject = projects.find(p => p.id === overId);
      if (overProject) {
        targetStatus = overProject.status;
      }
    }

    // Save final status if changed
    if (activeProject.status !== targetStatus) {
      const updated = { ...activeProject, status: targetStatus };
      await storage.saveProject(updated);
      setProjects(prev => prev.map(p => p.id === activeId ? updated : p));
    } else {
      // Just save to be safe (e.g. reorder within same list)
      await storage.saveProject(activeProject);
    }

    // Handle Reorder
    if (activeId !== overId) {
      setProjects(prev => {
        const oldIndex = prev.findIndex(p => p.id === activeId);
        const newIndex = prev.findIndex(p => p.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(prev, oldIndex, newIndex);

        // Update sort orders
        const updated = reordered.map((p, i) => ({ ...p, sortOrder: i }));
        storage.saveAllProjects(updated);
        return updated;
      });
    }
  }, [projects]);

  // Filter logic
  const filteredProjects = projects.filter(p => {
    // 1. Exclude Forks
    if (p.isFork) return false;

    // 2. Specific Blacklist (Case-insensitive)
    const BLACKLIST = [
      'preconcebidoerp',
      'llibre-2',
      'modelsproces_project',
      'weather underground',
      'weather-underground',
      'practica1',
      'packt-pub'
    ];
    if (BLACKLIST.includes(p.name.toLowerCase())) return false;

    // 3. Ownership Check (Must contain githubUsername if on GitHub)
    // If it's a "local only" project (isOnGithub=false), we keep it (unless blacklisted above).
    // If it IS on GitHub, we check the URL for the username to ensure authorship.
    if (p.isOnGithub && p.githubUrl) {
      // If githubUsername is not set yet, we might fallback or skip this check?
      // But typically it is set to 'marcoliva96'.
      if (githubUsername && !p.githubUrl.toLowerCase().includes(githubUsername.toLowerCase())) {
        return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (p.name || '').toLowerCase().includes(q)
        || (p.description || '').toLowerCase().includes(q)
        || (p.techStack || []).some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Project Type filter
    if (activeFilters.projectType && p.projectType !== activeFilters.projectType) return false;
    if (activeFilters.parentId && p.parentId !== activeFilters.parentId) return false;

    // Boolean Filters (Active = Must be TRUE)
    const bools = ['check_pc', 'check_responsive', 'check_android', 'check_ios', 'check_vercel', 'check_multiusuario', 'check_agent'];
    for (const b of bools) {
      if (activeFilters[b] === true && !p[b]) return false;
    }

    return true;
  });

  // We now consider a project "primary" if it does not have a parent.
  const primaryProjects = filteredProjects.filter(p => !p.parentId);
  // We attach children to primary projects
  const projectsWithChildren = primaryProjects.map(parent => ({
    ...parent,
    children: filteredProjects.filter(p => p.parentId === parent.id)
  }));

  const toggleFilter = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const toggleBooleanFilter = (key) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key] === true ? null : true
    }));
  };

  // Get unique values for filter bar
  const allTypes = categories.filter(c => c.categoryType === 'projectType');

  // Settings callbacks
  const handleSettingsSave = useCallback(async (settings) => {
    if (settings.githubToken !== undefined) {
      await storage.setAppState('githubToken', settings.githubToken);
      setGithubToken(settings.githubToken);
      // githubService.initGitHub(settings.githubToken); // No longer using direct PAT
    }
    if (settings.githubUsername !== undefined) {
      await storage.setAppState('githubUsername', settings.githubUsername);
      setGithubUsername(settings.githubUsername);
    }
    if (settings.localPath !== undefined) {
      await storage.setAppState('localPath', settings.localPath);
      setLocalPath(settings.localPath);
    }
    if (settings.categories) {
      setCategories(settings.categories);
    }
    if (settings.statuses) {
      setStatuses(settings.statuses);
    }
  }, []);



  if (!authToken) {
    return <Login onLogin={handleLogin} />;
  }

  if (showSettings) {
    return (
      <SettingsView
        githubToken={githubToken}
        githubUsername={githubUsername}
        localPath={localPath}
        categories={categories}
        statuses={statuses}
        onSave={handleSettingsSave}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="app-layout">
      {showWiki && <WikiModal onClose={() => setShowWiki(false)} />}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <header className="app-header">
          <div className="app-header__logo">
            <Sparkles size={22} />
            DevDash
          </div>
          <div className="app-header__actions">
            <div className="search-input" style={{ marginRight: 8 }}>
              <Search size={16} className="search-input__icon" />
              <input
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="view-toggle" style={{ marginRight: 16 }}>
              <button
                className={`view-toggle__btn ${viewMode === VIEW_MODES.CARDS ? 'active' : ''}`}
                onClick={() => setViewMode(VIEW_MODES.CARDS)}
                title="Vista fichas"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`view-toggle__btn ${viewMode === VIEW_MODES.LIST ? 'active' : ''}`}
                onClick={() => setViewMode(VIEW_MODES.LIST)}
                title="Vista lista"
              >
                <List size={16} />
              </button>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowWiki(true)} style={{ marginRight: 8 }}>
              Leyenda
            </button>
            {STATIC_GITHUB_TOKEN && (
              <span className="badge badge--success" style={{ marginRight: 8, fontSize: '0.75rem' }}>
                Token Estático Activo
              </span>
            )}
            <button
              className={`btn btn--primary ${syncing ? 'btn--spinning' : ''}`}
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw size={16} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button className="btn btn--ghost btn--icon" onClick={() => setShowSettings(true)}>
              <Settings size={20} />
            </button>
            <button className="btn btn--ghost btn--icon" onClick={handleLogout} title="Cerrar Sessión">
              <Lock size={20} />
            </button>
          </div>
        </header>

        <main className="app-main">
          {/* New repos banner */}
          {newRepos.length > 0 && (
            <NewReposBanner repos={newRepos} onDismiss={() => setNewRepos([])} />
          )}

          {/* Filter bar */}
          <div className="filter-bar">
            {/* Boolean Toggles */}
            {[
              { key: 'check_agent', icon: <Terminal size={12} />, label: 'Agent' },
              { key: 'check_pc', icon: <Monitor size={12} />, label: 'PC' },
              { key: 'check_responsive', icon: <Smartphone size={12} />, label: 'Responsive' },
              { key: 'check_android', icon: <span style={{ fontSize: 9, fontWeight: 700 }}>AND</span>, label: 'Android' },
              { key: 'check_ios', icon: <span style={{ fontSize: 9, fontWeight: 700 }}>iOS</span>, label: 'iOS' },
              { key: 'check_vercel', icon: <Cloud size={12} />, label: 'Vercel' },
              { key: 'check_multiusuario', icon: <Users size={12} />, label: 'Multi' },
            ].map(f => (
              <button
                key={f.key}
                className={`filter-chip ${activeFilters[f.key] ? 'active' : ''}`}
                onClick={() => toggleBooleanFilter(f.key)}
              >
                {f.icon} {f.label}
              </button>
            ))}

            <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-subtle)', margin: '0 8px' }} />

            {allTypes.map(t => (
              <button
                key={t.id}
                className={`filter-chip ${activeFilters.projectType === t.value ? 'active' : ''}`}
                onClick={() => toggleFilter('projectType', t.value)}
              >
                {t.icon} {t.value}
              </button>
            ))}
          </div>

          {/* Projects */}
          {!initialized ? (
            <div className="loading-spinner" />
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={64} />
              <div className="empty-state__title">
                {projects.length === 0 ? 'No hay proyectos aún' : 'Sin resultados'}
              </div>
              <div className="empty-state__text">
                {projects.length === 0
                  ? 'Configura tu token de GitHub y sincroniza para empezar.'
                  : 'Prueba con otros filtros o búsqueda.'}
              </div>
              {projects.length === 0 && (
                <button className="btn btn--primary" onClick={handleSync}>
                  <RefreshCw size={16} /> Sincronizar ahora
                </button>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {viewMode === VIEW_MODES.CARDS ? (
                <div className="board-container">
                  {statuses.map(status => {
                    const statusProjects = projectsWithChildren.filter(p => p.status === status.value);
                    return (
                      <StatusColumn
                        key={status.id}
                        status={status}
                        projects={statusProjects}
                        categories={categories}
                        onProjectClick={setSelectedProject}
                      />
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '0 var(--space-xl)' }}>
                  <SortableContext
                    items={filteredProjects.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <table className="projects-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Nombre</th>
                          <th>Descripción</th>
                          <th>Git</th>
                          <th>Visibilidad</th>
                          {/* Scope removed */}
                          <th>Tipo</th>
                          <th>Tecnología</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectsWithChildren.map(project => (
                          <ProjectRow
                            key={project.id}
                            project={project}
                            categories={categories}
                            statuses={statuses}
                            onClick={() => setSelectedProject(project)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </SortableContext>
                </div>
              )}
            </DndContext>
          )}
        </main>

        {/* Project detail modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            categories={categories}
            statuses={statuses}
            allProjects={projects}
            onSave={handleSaveProject}
            onClose={() => setSelectedProject(null)}
            githubUsername={githubUsername}
          />
        )}
      </div>
    </div>
  );
}

export default App;
