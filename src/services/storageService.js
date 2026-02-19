import { openDB } from 'idb';

const DB_NAME = 'devdash';
const DB_VERSION = 1;

const STORES = {
    projects: 'projects',
    groups: 'groups',
    categories: 'categories',
    appState: 'appState',
};

async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORES.projects)) {
                db.createObjectStore(STORES.projects, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.groups)) {
                db.createObjectStore(STORES.groups, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.categories)) {
                db.createObjectStore(STORES.categories, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.appState)) {
                db.createObjectStore(STORES.appState, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(STORES.statuses)) {
                db.createObjectStore(STORES.statuses, { keyPath: 'id' });
            }
        },
    });
}

// Generic CRUD
export async function getAll(storeName) {
    const db = await getDB();
    return db.getAll(storeName);
}

export async function getById(storeName, id) {
    const db = await getDB();
    return db.get(storeName, id);
}

export async function put(storeName, item) {
    const db = await getDB();
    return db.put(storeName, item);
}

export async function putAll(storeName, items) {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readwrite');
    for (const item of items) {
        tx.store.put(item);
    }
    await tx.done;
}

export async function deleteItem(storeName, id) {
    const db = await getDB();
    return db.delete(storeName, id);
}

export async function clearStore(storeName) {
    const db = await getDB();
    return db.clear(storeName);
}

// App State helpers
// App State helpers
export async function getAppState(key) {
    // Migrate to localStorage for consistent persistence of token/settings
    const value = localStorage.getItem(`devdash_${key}`);
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export async function setAppState(key, value) {
    localStorage.setItem(`devdash_${key}`, JSON.stringify(value));
    return value;
}

// Projects
export async function getAllProjects() {
    return getAll(STORES.projects);
}

export async function saveProject(project) {
    return put(STORES.projects, project);
}

export async function saveAllProjects(projects) {
    return putAll(STORES.projects, projects);
}

export async function deleteProject(id) {
    return deleteItem(STORES.projects, id);
}

// Groups
export async function getAllGroups() {
    return getAll(STORES.groups);
}

export async function saveGroup(group) {
    return put(STORES.groups, group);
}

export async function deleteGroup(id) {
    return deleteItem(STORES.groups, id);
}

// Categories
export async function getAllCategories() {
    return getAll(STORES.categories);
}

export async function saveCategory(cat) {
    return put(STORES.categories, cat);
}

export async function deleteCategory(id) {
    return deleteItem(STORES.categories, id);
}

// Statuses
export async function getAllStatuses() {
    return getAll(STORES.statuses);
}

export async function saveStatus(status) {
    return put(STORES.statuses, status);
}

export async function deleteStatus(id) {
    return deleteItem(STORES.statuses, id);
}

// Export all data
export async function exportAllData() {
    const projects = await getAllProjects();
    const groups = await getAllGroups();
    const categories = await getAllCategories();
    const statuses = await getAllStatuses();
    const db = await getDB();
    const appStates = await db.getAll(STORES.appState);
    return { projects, groups, categories, statuses, appState: appStates };
}

// Import all data
export async function importAllData(data) {
    if (data.projects) {
        await clearStore(STORES.projects);
        await putAll(STORES.projects, data.projects);
    }
    if (data.groups) {
        await clearStore(STORES.groups);
        await putAll(STORES.groups, data.groups);
    }
    if (data.categories) {
        await clearStore(STORES.categories);
        await putAll(STORES.categories, data.categories);
    }
    if (data.statuses) {
        await clearStore(STORES.statuses);
        await putAll(STORES.statuses, data.statuses);
    }
    if (data.appState) {
        await clearStore(STORES.appState);
        await putAll(STORES.appState, data.appState);
    }
}

export { STORES };
