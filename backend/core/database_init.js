const collections = require("./collections");
const { setupLogging, getLogger } = require("./logger");

setupLogging();
const logger = getLogger("database_init");

logger.info("Starting Backend (Express)");

const REQUIRED_TABLES = [
  collections.USERS,
  collections.AUTH_USERS,
  collections.CUISINES,
  collections.RECIPE,
  collections.RECIPE_INGREDIENTS,
  collections.INGREDIENTS,
  collections.RECIPE_RATINGS,
  collections.BOOKMARKS,
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
    case collections.USERS:
      sql = `
        CREATE TABLE users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255)  NOT NULL,
          password VARCHAR(255) NOT NULL,
          username VARCHAR(255) NOT NULL,
          users_type VARCHAR(50) NOT NULL,
        );
      `;
      break;

    case collections.AUTH_USERS:
      sql = `
        CREATE TABLE auth_users (
          user_id INT NOT NULL,
          email VARCHAR(255)  NOT NULL,
          password VARCHAR(255) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          UNIQUE (user_id)
        );
      `;
      break;

    case collections.CUISINES:
      sql = `
        CREATE TABLE cuisines (
          cuisine_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL
        );
      `;
      break;

    case collections.INGREDIENTS:
      sql = `
        CREATE TABLE ingredients (
          ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL
        );
      `;
      break;

    case collections.RECIPE:
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

    case collections.RECIPE_INGREDIENTs:
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

    case collections.RECIPE_RATINGS:
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

    case collections.BOOKMARKS:
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
        case collections.AUTH_USERS:
            if (!(await indexExists(db, "auth_users", "idx_user_id"))) {
                await db.query(`ALTER TABLE auth_users ADD UNIQUE INDEX idx_user_id (user_id)`);
            }

            if (!(await indexExists(db, "auth_users", "idx_email"))) {
                await db.query(`ALTER TABLE auth_users ADD UNIQUE INDEX idx_email (email)`);
            }
            break;

        case collections.USERS:
            if (!(await indexExists(db, "users", "idx_email"))) {
                await db.query(`ALTER TABLE users ADD UNIQUE INDEX idx_email (email)`);
            }
            break;

        case collections.BOOKMARKS:
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

module.exports = { initializeCollections, checkCollectionHealth };
