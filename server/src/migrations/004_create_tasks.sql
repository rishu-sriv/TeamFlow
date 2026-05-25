CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo',
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  due_date DATE,
  is_overdue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks(due_date, is_overdue) WHERE is_overdue = FALSE;
