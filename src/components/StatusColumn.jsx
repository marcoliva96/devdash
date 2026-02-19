import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ProjectCard from './ProjectCard';

export default function StatusColumn({ status, projects, categories, onProjectClick }) {
    const { setNodeRef } = useDroppable({
        id: status.id,
        data: {
            type: 'Column',
            status,
        }
    });

    return (
        <div className="status-column">
            <div className="status-column__header" style={{ borderTopColor: status.color }}>
                <div className="status-column__title">
                    <span style={{ marginRight: 6 }}>{status.icon}</span>
                    {status.value}
                    <span className="status-column__count">{projects.length}</span>
                </div>
            </div>

            <div ref={setNodeRef} className="status-column__content">
                <SortableContext
                    items={projects.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            categories={categories}
                            statusObj={status}
                            onClick={() => onProjectClick(project)}
                            simplified={true}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
