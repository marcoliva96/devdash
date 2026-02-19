import { useState } from 'react';
import {
    ArrowLeft, Key, FolderOpen, Tag, Layers, Plus, Trash2,
    Download, Upload, Shield, Users, Save
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as storage from '../services/storageService';
import { GROUP_COLORS, STATIC_GITHUB_TOKEN } from '../utils/constants';

export default function SettingsView({
    githubToken: initialToken, githubUsername: initialUsername, localPath: initialPath,
    categories: initialCategories, groups: initialGroups, statuses: initialStatuses,
    onSave, onClose, onCreateGroup, onDeleteGroup
}) {
    const [githubToken, setGithubToken] = useState(initialToken || STATIC_GITHUB_TOKEN || '');
    const [githubUsername, setGithubUsername] = useState(initialUsername || '');
    const [localPath, setLocalPath] = useState(initialPath || '');
    const [categories, setCategories] = useState([...initialCategories]);
    const [groups, setGroups] = useState([...initialGroups]);
    const [statuses, setStatuses] = useState([...(initialStatuses || [])]);

    // New category inputs
    const [newCatValue, setNewCatValue] = useState('');
    const [newCatType, setNewCatType] = useState('scope');
    const [newCatIcon, setNewCatIcon] = useState('');
    const [newCatColor, setNewCatColor] = useState('#6c5ce7');

    // New group
    const [newGroupName, setNewGroupName] = useState('');

    // New status
    const [newStatusValue, setNewStatusValue] = useState('');
    const [newStatusIcon, setNewStatusIcon] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#3498db');

    const handleSaveSettings = () => {
        onSave({ githubToken, githubUsername, localPath, categories, groups, statuses });
        onClose();
    };

    const addCategory = () => {
        if (!newCatValue.trim()) return;
        const newCat = {
            id: uuidv4(),
            categoryType: newCatType,
            value: newCatValue.trim(),
            color: newCatColor,
            icon: newCatIcon || '📌',
        };
        const updated = [...categories, newCat];
        setCategories(updated);
        storage.saveCategory(newCat);
        setNewCatValue('');
        setNewCatIcon('');
    };

    const removeCategory = async (id) => {
        const updated = categories.filter(c => c.id !== id);
        setCategories(updated);
        await storage.deleteCategory(id);
    };

    const addGroup = async (name) => {
        // Support both direct call and event
        const groupName = typeof name === 'string' ? name : newGroupName;
        if (!groupName || !groupName.trim()) return;

        const group = await onCreateGroup(groupName.trim());
        setGroups(prev => [...prev, group]);
        setNewGroupName('');
    };

    const removeGroup = async (id) => {
        await onDeleteGroup(id);
        setGroups(prev => prev.filter(g => g.id !== id));
    };

    const addStatus = () => {
        if (!newStatusValue.trim()) return;
        const newStatus = {
            id: `status-${uuidv4()}`,
            value: newStatusValue.trim(),
            color: newStatusColor,
            icon: newStatusIcon || '📌',
        };
        const updated = [...statuses, newStatus];
        setStatuses(updated);
        storage.saveStatus(newStatus);
        setNewStatusValue('');
        setNewStatusIcon('');
    };

    const removeStatus = async (id) => {
        const updated = statuses.filter(s => s.id !== id);
        setStatuses(updated);
        await storage.deleteStatus(id);
    };

    // Export / Import
    const handleExport = async () => {
        const data = await storage.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devdash-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                await storage.importAllData(data);
                window.location.reload();
            } catch (err) {
                alert('Error importando datos: ' + err.message);
            }
        };
        input.click();
    };

    const categoryTypes = [
        { key: 'scope', label: '🎯 Ámbito', icon: Shield },
        { key: 'projectType', label: '📂 Tipo de Proyecto', icon: Layers },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn--ghost btn--icon" onClick={onClose}>
                        <ArrowLeft size={20} />
                    </button>
                    <span style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>Configuración</span>
                </div>
                <button className="btn btn--primary" onClick={handleSaveSettings}>
                    <Save size={16} /> Guardar
                </button>
            </header>

            <main className="app-main" style={{ maxWidth: 800 }}>
                {/* GitHub Config */}
                <div className="settings-section">
                    <div className="settings-section__title">
                        <Key size={18} /> Conexión a GitHub
                    </div>
                    <div className="form-group">
                        <label>Personal Access Token</label>
                        <input
                            type="password"
                            value={githubToken}
                            onChange={e => setGithubToken(e.target.value)}
                            placeholder={STATIC_GITHUB_TOKEN || "ghp_xxxxxxxxxxxxxxxxxxxx"}
                        />
                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                            Genera un token en <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">GitHub → Settings → Tokens</a> con permiso "repo"
                        </p>
                    </div>
                    <div className="form-group">
                        <label>Nombre de usuario GitHub</label>
                        <input
                            value={githubUsername}
                            onChange={e => setGithubUsername(e.target.value)}
                            placeholder="marcoliva96"
                        />
                    </div>
                </div>

                {/* Local folder */}
                <div className="settings-section">
                    <div className="settings-section__title">
                        <FolderOpen size={18} /> Carpeta local de proyectos
                    </div>
                    <div className="form-group">
                        <label>Ruta de la carpeta</label>
                        <input
                            value={localPath}
                            onChange={e => setLocalPath(e.target.value)}
                            placeholder="/Users/axblue/Desktop/Repositoris"
                        />
                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                            DevDash escaneará esta carpeta buscando proyectos no subidos a GitHub
                        </p>
                    </div>
                </div>

                {/* Groups */}
                <div className="settings-section">
                    <div className="settings-section__title">
                        <Users size={18} /> Grupos de Proyectos
                    </div>
                    <div className="category-list">
                        {groups.map(g => (
                            <div key={g.id} className="category-item">
                                <div className="category-item__left">
                                    <span className="category-item__color" style={{ background: g.color }} />
                                    {g.name}
                                </div>
                                <button className="btn btn--ghost btn--icon btn--sm" onClick={() => removeGroup(g.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="add-category-row">
                        <input
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="Nombre del nuevo grupo..."
                            onKeyDown={e => e.key === 'Enter' && addGroup()}
                        />
                        <button className="btn btn--secondary btn--sm" onClick={addGroup}>
                            <Plus size={14} /> Crear
                        </button>
                    </div>
                </div>

                {/* Statuses */}
                <div className="settings-section">
                    <div className="settings-section__title">
                        <Layers size={18} /> Estados de Proyecto
                    </div>
                    <div className="category-list">
                        {statuses.map(s => (
                            <div key={s.id} className="category-item">
                                <div className="category-item__left">
                                    <span className="category-item__color" style={{ background: s.color }} />
                                    <span>{s.icon}</span>
                                    <span>{s.value}</span>
                                </div>
                                <button className="btn btn--ghost btn--icon btn--sm" onClick={() => removeStatus(s.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="add-category-row" style={{ alignItems: 'center' }}>
                        <input
                            style={{ width: 50, textAlign: 'center', padding: '4px' }}
                            value={newStatusIcon}
                            onChange={e => setNewStatusIcon(e.target.value)}
                            placeholder="🚦"
                            maxLength={2}
                        />
                        <input
                            value={newStatusValue}
                            onChange={e => setNewStatusValue(e.target.value)}
                            placeholder="Nombre del nuevo estado..."
                            onKeyDown={e => { if (e.key === 'Enter') addStatus(); }}
                        />
                        <input
                            type="color"
                            value={newStatusColor}
                            onChange={e => setNewStatusColor(e.target.value)}
                            style={{ width: 36, padding: 2, border: 'none', cursor: 'pointer', background: 'transparent' }}
                        />
                        <button className="btn btn--secondary btn--sm" onClick={addStatus}>
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                {categoryTypes.map(({ key, label }) => (
                    <div key={key} className="settings-section">
                        <div className="settings-section__title">{label}</div>
                        <div className="category-list">
                            {categories.filter(c => c.categoryType === key).map(cat => (
                                <div key={cat.id} className="category-item">
                                    <div className="category-item__left">
                                        <span className="category-item__color" style={{ background: cat.color }} />
                                        <span>{cat.icon}</span>
                                        <span>{cat.value}</span>
                                    </div>
                                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => removeCategory(cat.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="add-category-row" style={{ alignItems: 'center' }}>
                            <input
                                style={{ width: 50, textAlign: 'center', padding: '4px' }}
                                value={newCatType === key ? newCatIcon : ''}
                                onChange={e => { setNewCatType(key); setNewCatIcon(e.target.value); }}
                                placeholder="🔖"
                                maxLength={2}
                            />
                            <input
                                value={newCatType === key ? newCatValue : ''}
                                onChange={e => { setNewCatType(key); setNewCatValue(e.target.value); }}
                                placeholder={`Nuevo valor de ${label.split(' ').slice(1).join(' ').toLowerCase()}...`}
                                onKeyDown={e => { if (e.key === 'Enter') { setNewCatType(key); addCategory(); } }}
                            />
                            <input
                                type="color"
                                value={newCatType === key ? newCatColor : '#6c5ce7'}
                                onChange={e => { setNewCatType(key); setNewCatColor(e.target.value); }}
                                style={{ width: 36, padding: 2, border: 'none', cursor: 'pointer', background: 'transparent' }}
                            />
                            <button className="btn btn--secondary btn--sm" onClick={() => { setNewCatType(key); addCategory(); }}>
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Export / Import */}
                <div className="settings-section">
                    <div className="settings-section__title">
                        <Download size={18} /> Datos
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn--secondary" onClick={handleExport}>
                            <Download size={16} /> Exportar JSON
                        </button>
                        <button className="btn btn--secondary" onClick={handleImport}>
                            <Upload size={16} /> Importar JSON
                        </button>
                    </div>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
                        Exporta todos tus datos para hacer backup o migrarlos a otro navegador
                    </p>
                </div>
            </main>
        </div>
    );
}
