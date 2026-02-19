import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TECH_COLORS } from '../utils/constants';

export default function ProjectRow({ project, categories, statuses, onClick }) {
    const {
        attributes, listeners, setNodeRef, transform, transition, isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const typeCat = categories.find(c => c.categoryType === 'projectType' && c.value === project.projectType);
    const statusObj = statuses.find(s => s.value === project.status);

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'is-dragging' : ''}
            onClick={onClick}
        >
            <td style={{ width: 30, cursor: 'grab' }} {...attributes} {...listeners}>
                <GripVertical size={14} style={{ color: 'var(--text-tertiary)' }} />
            </td>
            <td>
                <div className="table-name-cell">
                    {project.isNew && <span className="badge badge--new" style={{ fontSize: '0.6rem' }}>NEW</span>}
                    <span style={{ fontWeight: 500 }}>{project.name}</span>
                </div>
            </td>
            <td style={{ color: 'var(--text-secondary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.description || project.githubDescription || '—'}
            </td>
            <td>
                {statusObj ? (
                    <span className="badge" style={{
                        backgroundColor: statusObj.color + '20',
                        color: statusObj.color,
                        borderColor: statusObj.color,
                        fontSize: '0.65rem',
                        padding: '2px 6px'
                    }}>
                        {statusObj.icon} {statusObj.value}
                    </span>
                ) : '—'}
            </td>
            <td>
                <span className={`status-dot ${project.isOnGithub ? 'status-dot--green' : 'status-dot--red'}`}
                    title={project.isOnGithub ? 'En GitHub' : 'Solo local'} />
            </td>
            <td>
                {project.isPublic === true && <span className="status-dot status-dot--green" title="Público" />}
                {project.isPublic === false && <span className="status-dot status-dot--yellow" title="Privado" />}
                {project.isPublic == null && <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
            </td>
            {/* Scope removed */}
            <td>
                {typeCat ? (
                    <span className="tag-chip" style={{ borderColor: typeCat.color, color: typeCat.color, fontSize: '0.65rem' }}>
                        {typeCat.icon} {typeCat.value}
                    </span>
                ) : '—'}
            </td>
            <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(project.techStack || []).slice(0, 3).map(tech => (
                        <span
                            key={tech}
                            className="tag-chip"
                            style={{
                                borderColor: TECH_COLORS[tech] || '#6b7280',
                                color: TECH_COLORS[tech] || '#9ca3b0',
                                fontSize: '0.65rem',
                            }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </td>
        </tr>
    );
}
