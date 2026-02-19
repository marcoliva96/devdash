import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical, Github, FolderOpen, ExternalLink,
    Monitor, Smartphone, Cloud, Users, Globe, Lock, Terminal
} from 'lucide-react';
import { TECH_COLORS } from '../utils/constants';

export default function ProjectCard({ project, categories, onClick, simplified, statusObj }) {
    const {
        attributes, listeners, setNodeRef, transform, transition, isDragging,
    } = useSortable({
        id: project.id,
        data: {
            type: 'Project',
            project,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const typeCat = categories.find(c => c.categoryType === 'projectType' && c.value === project.projectType);

    // Map boolean keys to icons
    const booleanIcons = [
        { key: 'check_agent', icon: <Terminal size={14} />, label: 'Agent' },
        { key: 'check_pc', icon: <Monitor size={14} />, label: 'PC' },
        { key: 'check_responsive', icon: <Smartphone size={14} />, label: 'Responsive' },
        { key: 'check_android', icon: <div style={{ fontSize: 10, fontWeight: 700 }}>AND</div>, label: 'Android' },
        { key: 'check_ios', icon: <div style={{ fontSize: 10, fontWeight: 700 }}>iOS</div>, label: 'iOS' },
        { key: 'check_vercel', icon: <Cloud size={14} />, label: 'Vercel' },
        { key: 'check_multiusuario', icon: <Users size={14} />, label: 'Multiusuario' },
        { key: 'check_publico', icon: <Globe size={14} />, label: 'Público' },
    ];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`project-card ${isDragging ? 'is-dragging' : ''} ${simplified ? 'simplified' : ''}`}
            onClick={onClick}
        >
            {/* Project Image */}
            {project.imageUrl && (
                <div style={{
                    height: 120,
                    backgroundImage: `url(${project.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: 'var(--space-md)',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    marginTop: '-16px',
                    marginLeft: '-16px',
                    marginRight: '-16px'
                }} />
            )}

            {/* Drag handle */}
            <div className="project-card__drag-handle" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>

            {/* Header */}
            <div className="project-card__header">
                <div className="project-card__name">
                    {project.deployUrl ? (
                        <a
                            href={project.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                            className="hover-underline"
                        >
                            {project.name}
                            <ExternalLink size={12} style={{ opacity: 0.5 }} />
                        </a>
                    ) : (
                        project.name
                    )}
                </div>
                <div className="project-card__badges">
                    {/* Only show status badge if passed */}
                    {statusObj && (
                        <span className="badge" style={{
                            backgroundColor: statusObj.color + '20',
                            color: statusObj.color,
                            borderColor: statusObj.color,
                            fontSize: '0.7rem'
                        }}>
                            {statusObj.icon} {statusObj.value}
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="project-card__description">
                {project.description || project.githubDescription || 'Sin descripción'}
            </div>

            {/* Tags & Tech */}
            <div className="project-card__meta">
                {typeCat && (
                    <span
                        className="tag-chip"
                        style={{ borderColor: typeCat.color, color: typeCat.color }}
                    >
                        {typeCat.icon} {typeCat.value}
                    </span>
                )}
                {!simplified && (project.techStack || []).slice(0, 3).map(tech => (
                    <span
                        key={tech}
                        className="tag-chip"
                        style={{
                            borderColor: TECH_COLORS[tech] || '#6b7280',
                            color: TECH_COLORS[tech] || '#9ca3b0',
                        }}
                    >
                        {tech}
                    </span>
                ))}
            </div>

            {/* Footer containing Boolean Icons & Links */}
            <div className="project-card__footer">
                <div className="project-card__footer-links">
                    {/* Links */}
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            title="Ver en GitHub"
                            style={{ marginRight: 8 }}
                        >
                            <Github size={14} />
                        </a>
                    )}
                    {project.localPath && (
                        <span title={project.localPath} style={{ color: 'var(--text-tertiary)', marginRight: 12 }}>
                            <FolderOpen size={14} />
                        </span>
                    )}

                    {/* Boolean Icons (Only non-null) */}
                    {booleanIcons.map(item => {
                        const val = project[item.key];
                        if (val === null || val === undefined) return null;
                        return (
                            <span
                                key={item.key}
                                title={`${item.label}: ${val ? 'Sí' : 'No'}`}
                                style={{
                                    color: val ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                                    opacity: val ? 1 : 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: 6
                                }}
                            >
                                {item.icon}
                            </span>
                        );
                    })}
                </div>
                {/* Date removed to save space for icons? Or keep it? User didn't say remove it. */}
            </div>
        </div>
    );
}
