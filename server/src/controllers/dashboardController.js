import db from '../db.js'

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get all projects in the user's team
    const projectsResult = await db.query(
      `SELECT p.id as project_id FROM projects p
       JOIN users u ON u.team_id = p.team_id
       WHERE u.id = $1`,
      [userId]
    )
    const projectIds = projectsResult.rows.map((r) => r.project_id)

    if (projectIds.length === 0) {
      return res.json({
        stats: { total: 0, byStatus: {}, overdue: 0, dueSoon: 0 },
        recentActivity: [],
        projectCount: 0,
      })
    }

    // Task stats
    const statsResult = await db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done,
        COUNT(CASE WHEN is_overdue = TRUE THEN 1 END) as overdue,
        COUNT(CASE WHEN due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' AND status != 'done' THEN 1 END) as due_soon
      FROM tasks
      WHERE project_id = ANY($1)`,
      [projectIds]
    )

    const stats = statsResult.rows[0]

    // Personal task stats — only tasks assigned to this user
    const myStatsResult = await db.query(
      `SELECT
        COUNT(*) as my_total,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as my_done
      FROM tasks
      WHERE assignee_id = $1`,
      [userId]
    )
    const myStats = myStatsResult.rows[0]

    // Recent activity across all user projects
    const activityResult = await db.query(
      `SELECT al.*, u.name as user_name, u.avatar_color, p.name as project_name
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       LEFT JOIN projects p ON p.id = al.project_id
       WHERE al.project_id = ANY($1)
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [projectIds]
    )

    return res.json({
      stats: {
        total: parseInt(stats.total),
        byStatus: {
          todo: parseInt(stats.todo),
          in_progress: parseInt(stats.in_progress),
          review: parseInt(stats.review),
          done: parseInt(stats.done),
        },
        overdue: parseInt(stats.overdue),
        dueSoon: parseInt(stats.due_soon),
        myTotal: parseInt(myStats.my_total),
        myDone: parseInt(myStats.my_done),
      },
      recentActivity: activityResult.rows,
      projectCount: projectIds.length,
    })
  } catch (err) {
    next(err)
  }
}

export const getOverdueTasks = async (req, res, next) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT t.*,
        p.name as project_name,
        u.name as assignee_name,
        u.avatar_color as assignee_avatar_color
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      JOIN users me ON me.team_id = p.team_id AND me.id = $1
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.is_overdue = TRUE AND t.status != 'done'
      ORDER BY t.due_date ASC`,
      [userId]
    )

    return res.json({ tasks: result.rows })
  } catch (err) {
    next(err)
  }
}
