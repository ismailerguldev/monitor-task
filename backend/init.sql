-- ==========================================
-- TASK MONITOR API - DATABASE INITIALIZATION
-- ==========================================

-- 1. USERS Tablosu
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. REFRESH TOKENS Tablosu
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '3 days',
    is_revoked BOOLEAN DEFAULT FALSE
);

-- 3. TASKS Tablosu
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE, -- Analizler için görev ne zaman bitti bilmeliyiz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    delete_remains TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 4. Performans İyileştirmeleri (İndeksler)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);

-- ==========================================
-- 5. Satır Düzeyi Güvenlik (Row Level Security - RLS)
-- ==========================================
-- Tablo için Satır Bazlı Güvenliği (RLS) aktif et
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Görevleri Görme Politikası (SELECT)
CREATE POLICY "Kullanicilar sadece kendi gorevlerini gorebilir" 
ON tasks FOR SELECT 
USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Görev Ekleme Politikası (INSERT)
CREATE POLICY "Kullanicilar sadece kendi adina gorev ekleyebilir" 
ON tasks FOR INSERT 
WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- Görev Güncelleme Politikası (UPDATE)
CREATE POLICY "Kullanicilar sadece kendi gorevlerini guncelleyebilir" 
ON tasks FOR UPDATE 
USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Görev Silme Politikası (DELETE)
CREATE POLICY "Kullanicilar sadece kendi gorevlerini silebilir" 
ON tasks FOR DELETE 
USING (user_id = current_setting('app.current_user_id', true)::uuid);