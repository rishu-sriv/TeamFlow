// Mock data mirroring seed.js — used when VITE_MOCK_MODE=true

export const USERS = {
  admin: {
    id: 'usr-admin-001',
    name: 'Alex Admin',
    email: 'admin@teamflow.com',
    avatar_color: '#6366f1',
  },
  member: {
    id: 'usr-member-002',
    name: 'Sam Member',
    email: 'member@teamflow.com',
    avatar_color: '#ec4899',
  },
  jordan: {
    id: 'usr-jordan-003',
    name: 'Jordan Dev',
    email: 'jordan@teamflow.com',
    avatar_color: '#10b981',
  },
}

export const CREDENTIALS = {
  'admin@teamflow.com':  { password: 'Admin@123',  user: USERS.admin },
  'member@teamflow.com': { password: 'Member@123', user: USERS.member },
  'jordan@teamflow.com': { password: 'Jordan@123', user: USERS.jordan },
}

export const PROJECTS = [
  {
    id: 'proj-001',
    name: 'Product Launch Q1',
    description: 'Planning and execution for Q1 product launch',
    owner_id: 'usr-admin-001',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    user_role: 'admin',
    member_count: '3',
    task_count: '10',
    done_count: '3',
  },
  {
    id: 'proj-002',
    name: 'Website Redesign',
    description: 'Full redesign of the marketing website',
    owner_id: 'usr-admin-001',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    user_role: 'admin',
    member_count: '2',
    task_count: '5',
    done_count: '1',
  },
]

export const MEMBERS = {
  'proj-001': [
    { id: 'usr-admin-001', name: 'Alex Admin',  email: 'admin@teamflow.com',  avatar_color: '#6366f1', role: 'admin',  joined_at: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'usr-member-002', name: 'Sam Member', email: 'member@teamflow.com', avatar_color: '#ec4899', role: 'member', joined_at: new Date(Date.now() - 28 * 86400000).toISOString() },
    { id: 'usr-jordan-003', name: 'Jordan Dev', email: 'jordan@teamflow.com', avatar_color: '#10b981', role: 'member', joined_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  ],
  'proj-002': [
    { id: 'usr-admin-001', name: 'Alex Admin',  email: 'admin@teamflow.com',  avatar_color: '#6366f1', role: 'admin',  joined_at: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: 'usr-member-002', name: 'Sam Member', email: 'member@teamflow.com', avatar_color: '#ec4899', role: 'member', joined_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  ],
}

const now = Date.now()
export const TASKS = {
  'proj-001': [
    {
      id: 'task-001', title: 'Define product requirements', description: 'Write detailed PRD for Q1 launch features.',
      project_id: 'proj-001', assignee_id: 'usr-admin-001', created_by: 'usr-admin-001',
      status: 'done', priority: 'critical', due_date: null, is_overdue: false,
      created_at: new Date(now - 25 * 86400000).toISOString(), updated_at: new Date(now - 10 * 86400000).toISOString(),
      assignee_name: 'Alex Admin', assignee_avatar_color: '#6366f1', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-002', title: 'Design system components', description: 'Build reusable UI component library.',
      project_id: 'proj-001', assignee_id: 'usr-member-002', created_by: 'usr-admin-001',
      status: 'done', priority: 'high', due_date: null, is_overdue: false,
      created_at: new Date(now - 22 * 86400000).toISOString(), updated_at: new Date(now - 8 * 86400000).toISOString(),
      assignee_name: 'Sam Member', assignee_avatar_color: '#ec4899', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-003', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated deploys.',
      project_id: 'proj-001', assignee_id: 'usr-jordan-003', created_by: 'usr-admin-001',
      status: 'done', priority: 'medium', due_date: null, is_overdue: false,
      created_at: new Date(now - 20 * 86400000).toISOString(), updated_at: new Date(now - 5 * 86400000).toISOString(),
      assignee_name: 'Jordan Dev', assignee_avatar_color: '#10b981', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-004', title: 'Implement authentication flow', description: 'JWT login, signup, and token refresh.',
      project_id: 'proj-001', assignee_id: 'usr-jordan-003', created_by: 'usr-admin-001',
      status: 'in_progress', priority: 'high', due_date: new Date(now + 3 * 86400000).toISOString().split('T')[0], is_overdue: false,
      created_at: new Date(now - 15 * 86400000).toISOString(), updated_at: new Date(now - 1 * 86400000).toISOString(),
      assignee_name: 'Jordan Dev', assignee_avatar_color: '#10b981', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-005', title: 'Build dashboard analytics', description: 'Recharts integration for KPI dashboard.',
      project_id: 'proj-001', assignee_id: 'usr-member-002', created_by: 'usr-admin-001',
      status: 'in_progress', priority: 'medium', due_date: new Date(now + 5 * 86400000).toISOString().split('T')[0], is_overdue: false,
      created_at: new Date(now - 12 * 86400000).toISOString(), updated_at: new Date(now - 2 * 86400000).toISOString(),
      assignee_name: 'Sam Member', assignee_avatar_color: '#ec4899', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-006', title: 'API rate limiting & security audit', description: 'Review all endpoints for vulnerabilities.',
      project_id: 'proj-001', assignee_id: 'usr-admin-001', created_by: 'usr-admin-001',
      status: 'review', priority: 'high', due_date: new Date(now - 2 * 86400000).toISOString().split('T')[0], is_overdue: true,
      created_at: new Date(now - 10 * 86400000).toISOString(), updated_at: new Date(now - 3 * 86400000).toISOString(),
      assignee_name: 'Alex Admin', assignee_avatar_color: '#6366f1', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-007', title: 'Write API documentation', description: 'Swagger/OpenAPI spec for all v1 endpoints.',
      project_id: 'proj-001', assignee_id: 'usr-member-002', created_by: 'usr-admin-001',
      status: 'review', priority: 'low', due_date: null, is_overdue: false,
      created_at: new Date(now - 8 * 86400000).toISOString(), updated_at: new Date(now - 1 * 86400000).toISOString(),
      assignee_name: 'Sam Member', assignee_avatar_color: '#ec4899', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-008', title: 'Performance testing & load analysis', description: 'k6 load tests for all critical API paths.',
      project_id: 'proj-001', assignee_id: 'usr-jordan-003', created_by: 'usr-admin-001',
      status: 'todo', priority: 'critical', due_date: new Date(now - 5 * 86400000).toISOString().split('T')[0], is_overdue: true,
      created_at: new Date(now - 6 * 86400000).toISOString(), updated_at: new Date(now - 6 * 86400000).toISOString(),
      assignee_name: 'Jordan Dev', assignee_avatar_color: '#10b981', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-009', title: 'Mobile responsive QA pass', description: 'Test all pages on 375px, 768px, 1280px breakpoints.',
      project_id: 'proj-001', assignee_id: 'usr-member-002', created_by: 'usr-admin-001',
      status: 'todo', priority: 'high', due_date: new Date(now + 7 * 86400000).toISOString().split('T')[0], is_overdue: false,
      created_at: new Date(now - 4 * 86400000).toISOString(), updated_at: new Date(now - 4 * 86400000).toISOString(),
      assignee_name: 'Sam Member', assignee_avatar_color: '#ec4899', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-010', title: 'Launch announcement blog post', description: 'Write and schedule the launch announcement.',
      project_id: 'proj-001', assignee_id: null, created_by: 'usr-admin-001',
      status: 'todo', priority: 'medium', due_date: new Date(now - 3 * 86400000).toISOString().split('T')[0], is_overdue: true,
      created_at: new Date(now - 3 * 86400000).toISOString(), updated_at: new Date(now - 3 * 86400000).toISOString(),
      assignee_name: null, assignee_avatar_color: null, created_by_name: 'Alex Admin',
    },
  ],
  'proj-002': [
    {
      id: 'task-011', title: 'Wireframes & prototypes', description: 'Figma wireframes for all 12 pages.',
      project_id: 'proj-002', assignee_id: 'usr-member-002', created_by: 'usr-admin-001',
      status: 'done', priority: 'high', due_date: null, is_overdue: false,
      created_at: new Date(now - 14 * 86400000).toISOString(), updated_at: new Date(now - 7 * 86400000).toISOString(),
      assignee_name: 'Sam Member', assignee_avatar_color: '#ec4899', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-012', title: 'Tailwind design tokens', description: 'Set up brand colors and typography scale.',
      project_id: 'proj-002', assignee_id: 'usr-admin-001', created_by: 'usr-admin-001',
      status: 'in_progress', priority: 'medium', due_date: new Date(now + 2 * 86400000).toISOString().split('T')[0], is_overdue: false,
      created_at: new Date(now - 10 * 86400000).toISOString(), updated_at: new Date(now - 1 * 86400000).toISOString(),
      assignee_name: 'Alex Admin', assignee_avatar_color: '#6366f1', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-013', title: 'Hero section animation', description: 'GSAP scroll-triggered hero entrance animation.',
      project_id: 'proj-002', assignee_id: 'usr-member-002', created_by: 'usr-admin-001',
      status: 'review', priority: 'medium', due_date: null, is_overdue: false,
      created_at: new Date(now - 7 * 86400000).toISOString(), updated_at: new Date(now - 2 * 86400000).toISOString(),
      assignee_name: 'Sam Member', assignee_avatar_color: '#ec4899', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-014', title: 'SEO meta tags & sitemap', description: 'Add structured data and XML sitemap.',
      project_id: 'proj-002', assignee_id: 'usr-admin-001', created_by: 'usr-admin-001',
      status: 'todo', priority: 'low', due_date: new Date(now + 10 * 86400000).toISOString().split('T')[0], is_overdue: false,
      created_at: new Date(now - 5 * 86400000).toISOString(), updated_at: new Date(now - 5 * 86400000).toISOString(),
      assignee_name: 'Alex Admin', assignee_avatar_color: '#6366f1', created_by_name: 'Alex Admin',
    },
    {
      id: 'task-015', title: 'Analytics integration', description: 'Integrate Plausible analytics tracking.',
      project_id: 'proj-002', assignee_id: null, created_by: 'usr-admin-001',
      status: 'todo', priority: 'low', due_date: null, is_overdue: false,
      created_at: new Date(now - 2 * 86400000).toISOString(), updated_at: new Date(now - 2 * 86400000).toISOString(),
      assignee_name: null, assignee_avatar_color: null, created_by_name: 'Alex Admin',
    },
  ],
}

export const ACTIVITY_LOGS = {
  'proj-001': [
    { id: 'act-001', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'project_created', entity_type: 'project', entity_id: 'proj-001', metadata: { name: 'Product Launch Q1' }, created_at: new Date(now - 30 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-002', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'member_added', entity_type: 'user', entity_id: 'usr-member-002', metadata: { userName: 'Sam Member' }, created_at: new Date(now - 28 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-003', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'member_added', entity_type: 'user', entity_id: 'usr-jordan-003', metadata: { userName: 'Jordan Dev' }, created_at: new Date(now - 20 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-004', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'task_created', entity_type: 'task', entity_id: 'task-004', metadata: { title: 'Implement authentication flow' }, created_at: new Date(now - 15 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-005', project_id: 'proj-001', user_id: 'usr-jordan-003', action: 'task_status_changed', entity_type: 'task', entity_id: 'task-004', metadata: { title: 'Implement authentication flow', from: 'todo', to: 'in_progress' }, created_at: new Date(now - 10 * 86400000).toISOString(), user_name: 'Jordan Dev', avatar_color: '#10b981' },
    { id: 'act-006', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'task_created', entity_type: 'task', entity_id: 'task-006', metadata: { title: 'API rate limiting & security audit' }, created_at: new Date(now - 10 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-007', project_id: 'proj-001', user_id: 'usr-member-002', action: 'task_status_changed', entity_type: 'task', entity_id: 'task-005', metadata: { title: 'Build dashboard analytics', from: 'todo', to: 'in_progress' }, created_at: new Date(now - 5 * 86400000).toISOString(), user_name: 'Sam Member', avatar_color: '#ec4899' },
    { id: 'act-008', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'task_updated', entity_type: 'task', entity_id: 'task-006', metadata: { title: 'API rate limiting & security audit', changes: ['status'] }, created_at: new Date(now - 3 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-009', project_id: 'proj-001', user_id: 'usr-admin-001', action: 'member_role_changed', entity_type: 'user', entity_id: 'usr-member-002', metadata: { userName: 'Sam Member', from: 'member', to: 'admin' }, created_at: new Date(now - 2 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-010', project_id: 'proj-001', user_id: 'usr-jordan-003', action: 'task_status_changed', entity_type: 'task', entity_id: 'task-007', metadata: { title: 'Write API documentation', from: 'in_progress', to: 'review' }, created_at: new Date(now - 1 * 86400000).toISOString(), user_name: 'Jordan Dev', avatar_color: '#10b981' },
  ],
  'proj-002': [
    { id: 'act-011', project_id: 'proj-002', user_id: 'usr-admin-001', action: 'project_created', entity_type: 'project', entity_id: 'proj-002', metadata: { name: 'Website Redesign' }, created_at: new Date(now - 15 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-012', project_id: 'proj-002', user_id: 'usr-admin-001', action: 'task_created', entity_type: 'task', entity_id: 'task-011', metadata: { title: 'Wireframes & prototypes' }, created_at: new Date(now - 14 * 86400000).toISOString(), user_name: 'Alex Admin', avatar_color: '#6366f1' },
    { id: 'act-013', project_id: 'proj-002', user_id: 'usr-member-002', action: 'task_status_changed', entity_type: 'task', entity_id: 'task-011', metadata: { title: 'Wireframes & prototypes', from: 'in_progress', to: 'done' }, created_at: new Date(now - 7 * 86400000).toISOString(), user_name: 'Sam Member', avatar_color: '#ec4899' },
  ],
}

export const TASK_HISTORY = {
  'task-004': [
    { id: 'hist-001', task_id: 'task-004', changed_by: 'usr-jordan-003', field: 'status', old_value: 'todo', new_value: 'in_progress', changed_at: new Date(now - 10 * 86400000).toISOString(), changed_by_name: 'Jordan Dev' },
    { id: 'hist-002', task_id: 'task-004', changed_by: 'usr-admin-001', field: 'priority', old_value: 'medium', new_value: 'high', changed_at: new Date(now - 12 * 86400000).toISOString(), changed_by_name: 'Alex Admin' },
  ],
  'task-006': [
    { id: 'hist-003', task_id: 'task-006', changed_by: 'usr-admin-001', field: 'status', old_value: 'in_progress', new_value: 'review', changed_at: new Date(now - 3 * 86400000).toISOString(), changed_by_name: 'Alex Admin' },
    { id: 'hist-004', task_id: 'task-006', changed_by: 'usr-admin-001', field: 'assignee_id', old_value: 'usr-jordan-003', new_value: 'usr-admin-001', changed_at: new Date(now - 5 * 86400000).toISOString(), changed_by_name: 'Alex Admin' },
  ],
}

export const DASHBOARD_STATS = {
  total: 15,
  byStatus: { todo: 5, in_progress: 3, review: 3, done: 4 },
  overdue: 3,
  dueSoon: 2,
}

export const RECENT_ACTIVITY = [
  ...ACTIVITY_LOGS['proj-001'].slice(-5).reverse(),
  ...ACTIVITY_LOGS['proj-002'].slice(-3).reverse(),
].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10).map(log => ({
  ...log,
  user: { id: log.user_id, name: log.user_name, avatar_color: log.avatar_color },
  project: PROJECTS.find(p => p.id === log.project_id) || { id: log.project_id, name: 'Unknown' },
}))
