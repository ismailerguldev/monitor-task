import pool from "../config/db";
import { DashboardAnalytics } from "../models/analytics.model";

export const getDashboardAnalytics = async (userId: string): Promise<DashboardAnalytics> => {
    const query = `
        WITH UserStats AS (
            SELECT 
                COUNT(*)::int AS total_tasks,
                COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed_tasks,
                COUNT(*) FILTER (
                    WHERE (status != 'COMPLETED' AND due_date < NOW()) 
                       OR (status = 'COMPLETED' AND completed_at > due_date)
                )::int AS delayed_tasks,
                COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= CURRENT_DATE)::int AS daily_completed,
                COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= date_trunc('week', CURRENT_DATE))::int AS weekly_completed,
                MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM completed_at))::int AS most_productive_hour
            FROM tasks
            WHERE user_id = $1 AND is_deleted = FALSE
        )
        SELECT 
            total_tasks,
            completed_tasks,
            delayed_tasks,
            daily_completed,
            weekly_completed,
            most_productive_hour,
            CASE 
                WHEN total_tasks > 0 THEN ROUND((delayed_tasks::numeric / total_tasks) * 100, 2)::float 
                ELSE 0::float 
            END AS delayed_ratio,
            json_build_object(
                'general', CASE 
                    WHEN total_tasks = 0 THEN 'Henüz hiç görev oluşturmadın. Panon bomboş, hadi ilk görevini ekleyerek başla!'
                    WHEN delayed_tasks > 0 AND (delayed_tasks::numeric / total_tasks) > 0.3 THEN 'Geciken görevlerin %30''u aşmış durumda. Birikmiş görevlerine odaklanmanı öneririm.'
                    ELSE 'İstikrarlı bir şekilde ilerliyorsun. Görevlerini zamanında tamamlamaya devam et!'
                END,
                
                'daily', CASE 
                    WHEN daily_completed >= 3 THEN 'Bugün harika bir iş çıkardın ve ' || daily_completed || ' görev bitirdin! Zamanını çok iyi yönetiyorsun.'
                    WHEN daily_completed > 0 THEN 'Bugün ' || daily_completed || ' görev tamamladın. Günü bitirmeden bir tane daha bitirmeye ne dersin?'
                    ELSE 'Bugün henüz görev tamamlamadın. Ufak bir adımla masaya oturma vakti geldi!'
                END,
                'weekly', CASE 
                    WHEN weekly_completed >= 10 THEN 'Bu hafta tam ' || weekly_completed || ' görev tamamladın! Harika bir haftaydı, devamını getir!'
                    WHEN weekly_completed > 0 THEN 'Bu hafta ' || weekly_completed || ' görev tamamladın. Haftanın geri kalanında da bu tempoyu korumaya çalış!'
                    ELSE 'Bu hafta henüz görev tamamlamadın. Haftanın geri kalanında küçük hedefler koyarak başlamaya ne dersin?'
                END,
                'productivity', CASE 
                    WHEN most_productive_hour IS NOT NULL THEN 'İstatistiklere göre en verimli saatin ' || most_productive_hour || ':00 civarı. Zor görevleri bu saatlere saklayabilirsin.'
                    ELSE 'Henüz en verimli saatini belirleyecek kadar veri yok. Görev bitirmeye devam et!'
                END
            ) AS suggestions
        FROM UserStats;
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] as DashboardAnalytics;
}