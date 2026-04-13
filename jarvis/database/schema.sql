-- ============================================================
-- J.A.R.V.I.S — Database Schema
-- ============================================================

-- Command history
CREATE TABLE IF NOT EXISTS command_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    raw_text TEXT NOT NULL,
    intent TEXT,
    entities TEXT,  -- JSON
    status TEXT DEFAULT 'pending',  -- pending, success, failed, cancelled
    response TEXT,
    execution_time_ms INTEGER,
    source TEXT DEFAULT 'voice'  -- voice, web, mobile
);

-- Conversation context
CREATE TABLE IF NOT EXISTS context_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT NOT NULL,  -- user, assistant
    content TEXT NOT NULL,
    metadata TEXT  -- JSON
);

-- Settings (key-value store for runtime overrides)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Paired devices
CREATE TABLE IF NOT EXISTS paired_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT,
    device_id TEXT UNIQUE NOT NULL,
    pairing_code TEXT,
    jwt_token TEXT,
    paired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_connected DATETIME,
    is_active BOOLEAN DEFAULT 1
);

-- Usage statistics
CREATE TABLE IF NOT EXISTS usage_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE DEFAULT (DATE('now')),
    command_count INTEGER DEFAULT 0,
    voice_commands INTEGER DEFAULT 0,
    web_commands INTEGER DEFAULT 0,
    mobile_commands INTEGER DEFAULT 0,
    most_used_intent TEXT,
    total_interaction_time_ms INTEGER DEFAULT 0
);

-- Automation routines
CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    steps TEXT NOT NULL,  -- JSON array of steps
    trigger_type TEXT DEFAULT 'manual',  -- manual, schedule, event
    trigger_value TEXT,  -- cron expression or event name
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_command_history_timestamp ON command_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_command_history_intent ON command_history(intent);
CREATE INDEX IF NOT EXISTS idx_context_memory_session ON context_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date);
