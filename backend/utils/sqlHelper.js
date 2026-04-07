class SQLHelper {
  static sanitizeIdentifier(identifier) {
    if (typeof identifier !== 'string') throw new Error('Identifier must be a string');
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) throw new Error('Invalid identifier format');
    return identifier;
  }

  static buildWhereClause(conditions, startIndex = 1) {
    const clauses = [];
    const values = [];
    let paramIndex = startIndex;
    for (const [key, value] of Object.entries(conditions)) {
      clauses.push(`${this.sanitizeIdentifier(key)} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    return { clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '', values, nextIndex: paramIndex };
  }

  static buildOrderBy(column, direction = 'ASC') {
    return `ORDER BY ${this.sanitizeIdentifier(column)} ${direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }

  static buildPagination(limit, offset = 0) {
    const safeLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100));
    const safeOffset = Math.max(0, parseInt(offset) || 0);
    return { clause: `LIMIT ${safeLimit} OFFSET ${safeOffset}`, limit: safeLimit, offset: safeOffset };
  }

  static validateId(id) {
    const numId = parseInt(id);
    if (isNaN(numId) || numId < 1) throw new Error('Invalid ID parameter');
    return numId;
  }
}

module.exports = SQLHelper;
