export const DEFAULT_PROJECT_TYPES = [
    { id: 'type-ml', categoryType: 'projectType', value: 'ML', color: '#e17055', icon: '🤖' },
    { id: 'type-finance', categoryType: 'projectType', value: 'Finanzas', color: '#00b894', icon: '💰' },
    { id: 'type-platform', categoryType: 'projectType', value: 'Plataforma', color: '#2d3436', icon: '🏗️' },
    { id: 'type-engineering', categoryType: 'projectType', value: 'Ingenieria', color: '#636e72', icon: '⚙️' },
    { id: 'type-music', categoryType: 'projectType', value: 'Musica', color: '#fd79a8', icon: '🎵' },
    { id: 'type-games', categoryType: 'projectType', value: 'Juegos', color: '#a29bfe', icon: '🎮' },
    { id: 'type-home-automation', categoryType: 'projectType', value: 'Domótica', color: '#00cec9', icon: '🏠' },
    { id: 'type-wiki', categoryType: 'projectType', value: 'Wiki/Repo', color: '#fdcb6e', icon: '📚' },
    { id: 'type-social', categoryType: 'projectType', value: 'Social', color: '#3498db', icon: '👥' },
    { id: 'type-other', categoryType: 'projectType', value: 'Otros', color: '#b2bec3', icon: '📁' },
];

export const DEFAULT_CAPABILITIES = [
    { id: 'cap-responsive', categoryType: 'capability', value: 'Mobile-responsive', color: '#00cec9', icon: '📐' },
    { id: 'cap-pwa', categoryType: 'capability', value: 'PWA', color: '#6c5ce7', icon: '⚡' },
    { id: 'cap-ssr', categoryType: 'capability', value: 'SSR', color: '#0984e3', icon: '🖥️' },
    { id: 'cap-realtime', categoryType: 'capability', value: 'Real-time', color: '#e17055', icon: '🔄' },
    { id: 'cap-auth', categoryType: 'capability', value: 'Auth', color: '#fdcb6e', icon: '🔐' },
    { id: 'cap-database', categoryType: 'capability', value: 'Database', color: '#55a3e8', icon: '🗄️' },
];

export const TECH_COLORS = {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3776ab',
    HTML: '#e34c26',
    CSS: '#264de4',
    Java: '#ed8b00',
    'C#': '#239120',
    PHP: '#777bb4',
    Ruby: '#cc342d',
    Go: '#00add8',
    Rust: '#dea584',
    Swift: '#fa7343',
    Kotlin: '#7f52ff',
    Vue: '#4fc08d',
    React: '#61dafb',
    Angular: '#dd0031',
    Svelte: '#ff3e00',
    'Next.js': '#000000',
};

export const GROUP_COLORS = [
    '#6c5ce7', '#0984e3', '#00b894', '#e17055', '#fdcb6e',
    '#a29bfe', '#55efc4', '#fab1a0', '#74b9ff', '#ff7675',
    '#81ecec', '#ffeaa7', '#dfe6e9', '#e84393', '#00cec9',
];

export const DEFAULT_STATUSES = [
    { id: 'status-initial', value: 'Inicial', color: '#bdc3c7', icon: '🏁' },
    { id: 'status-progress', value: 'En curs', color: '#3498db', icon: '🔨' },
    { id: 'status-testing', value: 'En millores', color: '#e67e22', icon: '🧪' },
    { id: 'status-finished', value: 'Acabat', color: '#2ecc71', icon: '✅' },
    { id: 'status-published', value: 'Publicat', color: '#9b59b6', icon: '🚀' },
];

export const VIEW_MODES = {
    CARDS: 'cards',
    LIST: 'list',
};

export const STATIC_GITHUB_TOKEN = '';
