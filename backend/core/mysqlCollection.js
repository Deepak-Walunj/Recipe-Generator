class MySQLCollection {
    constructor(db, tableName) {
        this.db = db;
        this.tableName = tableName;
    }

    async findOne(where) {
        const keys = Object.keys(where);
        const values = Object.values(where);

        const condition = keys.map(k => `${k} = ?`).join(" AND ");
        const [rows] = await this.db.query(
            `SELECT * FROM ${this.tableName} WHERE ${condition} LIMIT 1`,
            values
        );
        return rows[0] || null;
    }

    async insertOne(doc) {
        const keys = Object.keys(doc);
        const values = Object.values(doc);

        const columns = keys.join(",");
        const placeholders = keys.map(() => "?").join(",");

        const [result] = await this.db.query(
            `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
            values
        );
        return { insertedId: result.insertId };
    }

    async updateOne(where, update) {
        const updateKeys = Object.keys(update);
        const updateValues = Object.values(update);

        const whereKeys = Object.keys(where);
        const whereValues = Object.values(where);

        const updateClause = updateKeys.map(k => `${k}=?`).join(", ");
        const whereClause = whereKeys.map(k => `${k}=?`).join(" AND ");

        const [result] = await this.db.query(
            `UPDATE ${this.tableName} SET ${updateClause} WHERE ${whereClause}`,
            [...updateValues, ...whereValues]
        );

        return result;
    }
}

module.exports = MySQLCollection;
