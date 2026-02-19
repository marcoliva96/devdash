import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    SortableContext, rectSortingStrategy, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ProjectCard from './ProjectCard';
import ProjectRow from './ProjectRow';
import { VIEW_MODES } from '../utils/constants';

export default function GroupSection({ group, viewMode, onProjectClick, categories }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="group-section">
            <div className="group-section__header" onClick={() => setCollapsed(!collapsed)}>
                <div className="group-section__title">
                    <span className="group-section__color-dot" style={{ background: group.color }} />
                    {group.name}
                    <span className="group-section__count">({group.projects.length})</span>
                </div>
                <ChevronDown
                    size={18}
                    className={`group-section__chevron ${collapsed ? 'collapsed' : ''}`}
                />
            </div>

            {!collapsed && (
                <SortableContext
                    items={group.projects.map(p => p.id)}
                    strategy={viewMode === VIEW_MODES.CARDS ? rectSortingStrategy : verticalListSortingStrategy}
                >
                    {viewMode === VIEW_MODES.CARDS ? (
                        <div className="projects-grid">
                            {group.projects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    categories={categories}
                                    onClick={() => onProjectClick(project)}
                                />
                            ))}
                        </div>
                    ) : (
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Git</th>
                                    <th>Visibilidad</th>
                                    <th>Ámbito</th>
                                    <th>Tipo</th>
                                    <th>Tecnología</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.projects.map(project => (
                                    <ProjectRow
                                        key={project.id}
                                        project={project}
                                        categories={categories}
                                        onClick={() => onProjectClick(project)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </SortableContext>
            )}
        </div>
    );
}
