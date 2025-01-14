/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
    async addThread({
        id = 'thread-123',
        title = 'First Thread',
        body = 'Lorem ipsum dolor sir amet.',
        date = new Date().toISOString(),
        owner = 'user-123',
      }) {
        const query = {
          text: 'INSERT INTO threads (id, title, body, date, owner) VALUES ($1, $2, $3, $4, $5)',
          values: [id, title, body, date, owner],
        };
        
        await pool.query(query);
      },

  async getThreadDetailsById(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM Threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
