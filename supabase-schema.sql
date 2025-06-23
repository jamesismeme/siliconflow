-- SiliconFlow Platform Database Schema for Supabase
-- Project: SiliconFlow Platform
-- Database: PostgreSQL (Supabase)

-- 1. Token管理表
CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_today INTEGER DEFAULT 0,
    limit_per_day INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 调用日志表
CREATE TABLE call_logs (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id) ON DELETE SET NULL,
    model_name VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    response_time INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    error_message TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户设置表
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    custom_api_url TEXT,
    api_key TEXT,
    default_model VARCHAR(255),
    preferences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 系统统计表
CREATE TABLE system_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_response_time REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 模型使用统计表
CREATE TABLE model_stats (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    call_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_response_time REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_name, date)
);

-- 6. 管理员账户表
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_tokens_is_active ON tokens(is_active);
CREATE INDEX idx_tokens_usage_today ON tokens(usage_today);
CREATE INDEX idx_call_logs_token_id ON call_logs(token_id);
CREATE INDEX idx_call_logs_model_name ON call_logs(model_name);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at);
CREATE INDEX idx_call_logs_success ON call_logs(success);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_system_stats_date ON system_stats(date);
CREATE INDEX idx_model_stats_model_name ON model_stats(model_name);
CREATE INDEX idx_model_stats_date ON model_stats(date);
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新 updated_at 的表创建触发器
CREATE TRIGGER update_tokens_updated_at 
    BEFORE UPDATE ON tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_stats_updated_at 
    BEFORE UPDATE ON system_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_stats_updated_at
    BEFORE UPDATE ON model_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();