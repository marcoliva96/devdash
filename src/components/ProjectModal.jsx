import { useState, useEffect } from 'react';
import {
    X, Github, ExternalLink, FolderOpen, Save, GitCommit, Clock, Plus, RefreshCw
} from 'lucide-react';
import * as githubService from '../services/githubService';
import { TECH_COLORS } from '../utils/constants';
import TriStateToggle from './TriStateToggle';

export default function ProjectModal({
    project, categories, statuses, groups, onSave, onClose, githubUsername
}) {
    const [data, setData] = useState({ ...project });
    const [activeTab, setActiveTab] = useState('info');
    const [commits, setCommits] = useState(project.commitHistory || []);
    const [loadingCommits, setLoadingCommits] = useState(false);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(data) !== JSON.stringify(project)) {
                onSave({ ...data, isNew: false });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [data, onSave, project]);

    // Fetch commits on first open
    useEffect(() => {
        if (activeTab === 'timeline' && commits.length === 0 && project.isOnGithub && project.githubRepoName) {
            loadCommits();
        }
    }, [activeTab]);

    const loadCommits = async () => {
        setLoadingCommits(true);
        try {
            const fetched = await githubService.fetchCommits(githubUsername, project.githubRepoName);
            setCommits(fetched);
            // Save commits to project
            const updated = { ...data, commitHistory: fetched };
            setData(updated);
            onSave(updated);
        } catch (err) {
            console.error('Failed to load commits:', err);
        } finally {
            setLoadingCommits(false);
        }
    };

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    // Generate Screenshot URL helper
    const getScreenshotUrl = (url) => {
        if (!url) return null;
        return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
    };

    // Update image when deployUrl changes (if empty or already a screenshot)
    useEffect(() => {
        if (data.deployUrl && (!data.imageUrl || data.imageUrl.includes('microlink.io'))) {
            // Debounce slightly to avoid rapid updates
            const timer = setTimeout(() => {
                setData(prev => ({ ...prev, imageUrl: getScreenshotUrl(data.deployUrl) }));
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [data.deployUrl]);

    const handleRefreshScreenshot = () => {
        if (data.deployUrl) {
            // Force refresh by adding timestamp to bust cache if needed, though microlink caches heavily.
            // For now just re-set the URL.
            setData(prev => ({ ...prev, imageUrl: getScreenshotUrl(data.deployUrl) }));
        }
    };

    const scopes = categories.filter(c => c.categoryType === 'scope');
    const projectTypes = categories.filter(c => c.categoryType === 'projectType');
    const capabilityCats = categories.filter(c => c.categoryType === 'capability');

    // Group commits by date
    const commitsByDate = {};
    for (const c of commits) {
        const date = c.date ? new Date(c.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Desconocida';
        if (!commitsByDate[date]) commitsByDate[date] = [];
        commitsByDate[date].push(c);
    }

    const booleanFields = [
        { key: 'check_agent', label: 'Agent-friendly' },
        { key: 'check_pc', label: 'PC' },
        { key: 'check_responsive', label: 'Responsive' },
        { key: 'check_android', label: 'Android' },
        { key: 'check_ios', label: 'iOS' },
        { key: 'check_vercel', label: 'Vercel' },
        { key: 'check_multiusuario', label: 'Multiusuario' },
        { key: 'check_publico', label: 'Público' },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
                        <div className="modal__title" style={{ margin: 0 }}>{data.name}</div>
                        {/* Status badges (Moved to Header) */}
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                            {data.isOnGithub ? (
                                <span className="badge badge--github" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>✓ GitHub</span>
                            ) : (
                                <span className="badge badge--no-github" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>✗ Local</span>
                            )}
                            {data.isPublic === true && <span className="badge badge--public" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>🔓 Public</span>}
                            {data.isPublic === false && <span className="badge badge--private" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>🔒 Private</span>}
                            {data.isFork && <span className="badge badge--fork" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>⑂ Fork</span>}
                            {data.status && (
                                <span className="badge" style={{
                                    backgroundColor: statuses.find(s => s.value === data.status)?.color + '20',
                                    color: statuses.find(s => s.value === data.status)?.color,
                                    borderColor: statuses.find(s => s.value === data.status)?.color,
                                    padding: '2px 6px',
                                    fontSize: '0.7rem'
                                }}>
                                    {statuses.find(s => s.value === data.status)?.icon} {data.status}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {data.githubUrl && (
                            <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--icon" title="Ver en GitHub">
                                <Github size={18} />
                            </a>
                        )}
                        <button className="btn btn--ghost btn--icon" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ padding: '0 var(--space-xl)' }}>
                    <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Detalles</button>
                    <button className={`tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
                        Cronología {commits.length > 0 && `(${commits.length})`}
                    </button>
                </div>

                <div className="modal__body">
                    {/* DETAILS TAB (Merged Info + Classify) */}
                    {activeTab === 'info' && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>

                                {/* 1. Description (Full width) */}
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        value={data.description || ''}
                                        onChange={e => handleChange('description', e.target.value)}
                                        placeholder="Describe brevemente qué hace este proyecto..."
                                        rows={1}
                                    />
                                </div>

                                {/* 2. Main Content Grid (Image Left, Fields Right) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>

                                    {/* Left Column: Image (Large) & Checks */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {/* Image Upload */}
                                        <div className="form-group">
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '21/9', backgroundColor: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                                {data.imageUrl ? (
                                                    <div style={{
                                                        width: '100%', height: '100%',
                                                        backgroundImage: `url(${data.imageUrl})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                                                        <span style={{ fontSize: '0.8rem' }}>Sin imagen de portada</span>
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 4 }}>
                                                    <button className="btn btn--secondary btn--sm" onClick={handleRefreshScreenshot} title="Actualizar captura" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                                        <RefreshCw size={12} style={{ marginRight: 4 }} /> Preview
                                                    </button>
                                                    {data.imageUrl && (
                                                        <button className="btn btn--danger btn--sm" onClick={() => handleChange('imageUrl', null)} style={{ padding: '2px 6px' }}>
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checks Grid (Condensed to 4 columns) */}
                                        <div className="form-group">
                                            <label>Características</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                                {booleanFields.map(field => (
                                                    <TriStateToggle
                                                        key={field.key}
                                                        label={field.label}
                                                        value={data[field.key]}
                                                        onChange={(val) => handleChange(field.key, val)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Fields (Condensed) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {/* Project type */}
                                        <div className="form-group">
                                            <label>Tipo de proyecto</label>
                                            <select value={data.projectType || ''} onChange={e => handleChange('projectType', e.target.value)}>
                                                <option value="">Sin definir</option>
                                                {projectTypes.map(t => (
                                                    <option key={t.id} value={t.value}>{t.icon} {t.value}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Link to Project */}
                                        <div className="form-group">
                                            <label>Enlace al proyecto</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <input
                                                    type="url"
                                                    value={data.deployUrl || ''}
                                                    onChange={e => handleChange('deployUrl', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                                {data.deployUrl && (
                                                    <a href={data.deployUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--icon" title="Abrir enlace">
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Group assignment */}
                                        <div className="form-group">
                                            <label>Grupo</label>
                                            <select value={data.groupId || ''} onChange={e => handleChange('groupId', e.target.value || null)}>
                                                <option value="">Sin grupo</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Technologies (Read Only) */}
                                        <div className="form-group">
                                            <label>Tecnologías</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {(data.techStack || []).length === 0 ? <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>—</span> : (data.techStack || []).map(tech => (
                                                    <span key={tech} className="tag-chip"
                                                        style={{ borderColor: TECH_COLORS[tech] || '#6b7280', color: TECH_COLORS[tech] || '#9ca3b0', fontSize: '0.7rem', padding: '1px 6px' }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TIMELINE TAB */}
                    {activeTab === 'timeline' && (
                        <>
                            {!project.isOnGithub ? (
                                <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                                    <GitCommit size={48} />
                                    <div className="empty-state__title">Proyecto solo local</div>
                                    <div className="empty-state__text">La cronología de commits solo está disponible para proyectos en GitHub.</div>
                                </div>
                            ) : loadingCommits ? (
                                <div className="loading-spinner" />
                            ) : commits.length === 0 ? (
                                <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                                    <Clock size={48} />
                                    <div className="empty-state__title">Sin commits</div>
                                    <button className="btn btn--primary" onClick={loadCommits}>Cargar cronología</button>
                                </div>
                            ) : (
                                <div className="timeline">
                                    {Object.entries(commitsByDate).map(([date, dateCommits]) => (
                                        <div key={date}>
                                            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 8, marginTop: 16 }}>
                                                {date}
                                            </div>
                                            {dateCommits.map(commit => (
                                                <div key={commit.sha || commit.fullSha} className="timeline__item">
                                                    <div className="timeline__dot" />
                                                    <div className="timeline__message">{commit.message}</div>
                                                    <div className="timeline__sha">
                                                        <a href={commit.htmlUrl} target="_blank" rel="noopener noreferrer">
                                                            {commit.sha}
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
