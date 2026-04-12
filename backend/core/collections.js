export const TABLES = {
    USERS: 'users',
    ADMINS: 'admins',
    AUTH_USERS: 'auth_users',
    CUISINES: 'cuisines',
    RECIPE: 'recipe',
    RECIPE_STEPS: 'recipe_steps',
    RECIPE_INGREDIENTS: 'recipe_ingredients',
    INGREDIENTS: 'ingredients',
    RECIPE_RATINGS: 'recipe_ratings',
    BOOKMARKS: 'bookmarks',
};

export function getAll() {
    return Object.values(TABLES);
}

export function getByEntityType(entityType) {
    if (entityType === 'user') return TABLES.USERS;
    if (entityType === 'admin') return TABLES.ADMINS;
    throw new Error(`Unknown entity type: ${entityType}`);
}