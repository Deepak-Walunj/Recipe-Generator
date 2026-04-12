import { TABLES } from './collections.js';
import { setupLogging, getLogger } from './logger.js';

setupLogging();
const logger = getLogger("database_init");

logger.info("Starting Backend (Express)");

const REQUIRED_TABLES = [
  TABLES.USERS,
  TABLES.AUTH_USERS,
  TABLES.CUISINES,
  TABLES.RECIPE,
  TABLES.RECIPE_INGREDIENTS,
  TABLES.INGREDIENTS,
  TABLES.RECIPE_RATINGS,
  TABLES.BOOKMARKS
];

async function initializeCollections(db) {
  const [rows] = await db.query("SHOW TABLES");
  const existingNames = rows.map((row) => Object.values(row)[0]);

  for (const table of REQUIRED_TABLES) {
    // create missing tables
    if (!existingNames.includes(table)) {
      await createTable(db, table);
      logger.info(`Created missing table: ${table}`);
    }

    // create indexes
    await createIndexes(db, table);
  }
}

async function createTable(db, table) {
  let sql = "";

  switch (table) {
    case TABLES.USERS:
      sql = `
        CREATE TABLE users (
          user_id INT PRIMARY KEY,
          email VARCHAR(255) NULL,
          username VARCHAR(255) NOT NULL,
          users_type VARCHAR(50) NOT NULL,
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id) ON DELETE CASCADE
        );
      `;
      break;

    case TABLES.AUTH_USERS:
      sql = `
        CREATE TABLE auth_users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NULL,
          password VARCHAR(255) NULL,
          entity_type VARCHAR(50) NOT NULL,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NULL
        );
      `;
      break;

    case TABLES.CUISINES:
      sql = `
        CREATE TABLE cuisines (
          cuisine_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL
        );
      `;
      break;

    case TABLES.INGREDIENTS:
      sql = `
        CREATE TABLE ingredients (
          ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL
        );
      `;
      break;

    case TABLES.RECIPE:
      sql = `
        CREATE TABLE recipe (
          recipe_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          instruction TEXT,
          prep_time VARCHAR(10),
          cuisine_id INT NOT NULL,
          views INT DEFAULT 0,
          no_of_bookmarks INT DEFAULT 0,
          FOREIGN KEY (cuisine_id) REFERENCES cuisines(cuisine_id)
        );
      `;
      break;

    case TABLES.RECIPE_STEPS:
      sql = `
        CREATE TABLE recipe_steps (
          step_id INT AUTO_INCREMENT PRIMARY KEY,
          recipe_id INT NOT NULL,
          step_number INT NOT NULL,
          instruction TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_recipe_steps
          FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id) ON DELETE CASCADE,
          UNIQUE KEY unique_step_per_recipe (recipe_id, step_number)
        );
      `;
      break;

    case TABLES.RECIPE_INGREDIENTS:
      sql = `
        CREATE TABLE recipe_ingredients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          recipe_id INT NOT NULL,
          ingredient_id INT NOT NULL,
          FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
        );
      `;
      break;

    case TABLES.RECIPE_RATINGS:
      sql = `
        CREATE TABLE recipe_ratings (
          rating_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          recipe_id INT NOT NULL,
          rating INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id),
          FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
        );
      `;
      break;

    case TABLES.BOOKMARKS:
      sql = `
        CREATE TABLE bookmarks (
          bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          recipe_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id),
          FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
        );
      `;
      break;

    default:
      sql = `
        CREATE TABLE ${table} (
          id INT AUTO_INCREMENT PRIMARY KEY
        );
      `;
  }

  await db.query(sql);
}

async function indexExists(db, table, indexName) {
  const [rows] = await db.query(`
    SELECT COUNT(1) AS count
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND index_name = ?;
  `, [table, indexName]);

  return rows[0].count > 0;
}

async function createIndexes(db, table) {
    switch (table) {
        case TABLES.AUTH_USERS:
            if (!(await indexExists(db, "auth_users", "idx_user_id"))) {
                await db.query(`ALTER TABLE auth_users ADD UNIQUE INDEX idx_user_id (user_id)`);
            }

            if (!(await indexExists(db, "auth_users", "idx_email"))) {
                await db.query(`ALTER TABLE auth_users ADD UNIQUE INDEX idx_email (email)`);
            }
            break;

        case TABLES.USERS:
            if (!(await indexExists(db, "users", "idx_email"))) {
                await db.query(`ALTER TABLE users ADD UNIQUE INDEX idx_email (email)`);
            }
            break;

        case TABLES.BOOKMARKS:
            if (!(await indexExists(db, "bookmarks", "idx_user"))) {
                await db.query(`ALTER TABLE bookmarks ADD INDEX idx_user (user_id)`);
            }
            if (!(await indexExists(db, "bookmarks", "idx_recipe"))) {
                await db.query(`ALTER TABLE bookmarks ADD INDEX idx_recipe (recipe_id)`);
            }
            break;

        default:
            break;
    }
}

async function checkCollectionHealth(db) {
  const [rows] = await db.query("SHOW TABLES");
  const existing = rows.map((row) => Object.values(row)[0]);
  return REQUIRED_TABLES.every((tbl) => existing.includes(tbl));
}

export {initializeCollections, checkCollectionHealth};
