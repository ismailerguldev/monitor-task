import app from './app';
import pool from './config/db';
import dotenv from "dotenv";
import cron from 'node-cron';
import taskRepository from './repositories/task.repository';
dotenv.config();
const PORT = process.env.PORT || 3000;
cron.schedule('0 3 * * *', async () => {
    console.log("Gece vardiyası başladı, süresi dolan görevler temizleniyor...");
    await taskRepository.hardDeleteExpiredTasks();
});
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  const a = await pool.query("SELECT 1 as success");
  console.log(a.rows[0]["success"] ? "ilk query başarılı" : "başarısız");
});
