const app = require('./server');
const { connectDatabase } = require('./utils/database/db');
const { PORT } = require('./config/port');

app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server running on http://localhost:${PORT}`);
});