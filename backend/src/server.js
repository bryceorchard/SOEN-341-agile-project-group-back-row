import { openDb, migrate } from '../db/migrate.js';
import { createApp } from './app.js';
import { PORT } from './config.js';

const db = openDb();
migrate(db);
createApp(db).listen(PORT, () => console.log(`CareerConnect API listening on http://localhost:${PORT}`));
