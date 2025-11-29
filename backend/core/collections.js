module.exports = {
    USERS : 'users',
    ADMINS : 'admins',
    AUTH_USERS: 'auth_users',
    CUISINES: 'cuisines',
    RECIPE: 'recipe',
    RECIPE_INGREDIENTs: 'recipe_ingredients',
    INGREDIENTS : 'ingredients',
    RECIPE_RATINGS: 'recipe_ratings',
    BOOKMARKS: 'bookmarks',

    getAll() {
        return Object.values(this).filter(v => typeof v === 'string')
    },

    getByEntityType(entityType) {
        if (entityType === 'user') return this.USERS
        if (entityType === 'admin') return this.ADMIN
        throw new Error(`Unknown entity type: ${entityType}`);
    }
}