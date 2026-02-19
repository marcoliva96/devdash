import { Sparkles, X } from 'lucide-react';

export default function NewReposBanner({ repos, onDismiss }) {
    return (
        <div className="banner banner--info">
            <div className="banner__content">
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>
                    <strong>{repos.length} proyecto{repos.length > 1 ? 's' : ''} nuevo{repos.length > 1 ? 's' : ''}</strong> detectado{repos.length > 1 ? 's' : ''} desde tu última visita:{' '}
                    {repos.slice(0, 5).join(', ')}
                    {repos.length > 5 && ` y ${repos.length - 5} más`}
                </span>
            </div>
            <button className="banner__dismiss" onClick={onDismiss}>
                <X size={16} />
            </button>
        </div>
    );
}
