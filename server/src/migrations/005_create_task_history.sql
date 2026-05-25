CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  field VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
