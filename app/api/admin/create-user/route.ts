import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { nombre, apellido, email, password, rol } = body

    if (!nombre || !apellido || !email || !password || !rol) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!serviceRoleKey) {
  return NextResponse.json(
    { error: 'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local' },
    { status: 500 }
  )
}
    const adminSupabase = createClient(
      supabaseUrl,
      serviceRoleKey
    )

    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    const { error: profileError } = await adminSupabase
      .from('usuarios')
      .insert({
        id: userId,
        nombre,
        apellido,
        email,
        rol,
        activo: true,
      })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      userId,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error inesperado al crear usuario.' },
      { status: 500 }
    )
  }
}