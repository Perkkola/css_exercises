const app = require('./server');
const { connectDatabase } = require('./utils/database/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server running on http://localhost:${PORT}`);
});