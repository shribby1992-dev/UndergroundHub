interface Env {
  APPROVALS_DB: D1Database
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === 'GET') {
    const result = await env.APPROVALS_DB.prepare(
      'SELECT id, name, status, created_at FROM approvals ORDER BY id DESC'
    ).all()

    return Response.json(result.results)
  }

  if (request.method === 'POST') {
    const body = await request.json() as { name?: string; status?: string }

    if (!body.name || !body.status) {
      return Response.json(
        { error: 'name and status are required' },
        { status: 400 }
      )
    }

    const result = await env.APPROVALS_DB.prepare(
      'INSERT INTO approvals (name, status) VALUES (?, ?) RETURNING id, name, status, created_at'
    )
      .bind(body.name, body.status)
      .first()

    return Response.json(result, { status: 201 })
  }

  return new Response('Method Not Allowed', { status: 405 })
}
