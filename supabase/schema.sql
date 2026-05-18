-- BK2HGF — Supabase schema MVP
create extension if not exists "uuid-ossp";

do $$ begin create type user_role as enum ('becado', 'docente', 'administrador'); exception when duplicate_object then null; end $$;
do $$ begin create type procedure_status as enum ('pendiente','validado','rechazado','correccion_solicitada'); exception when duplicate_object then null; end $$;
do $$ begin create type notification_type as enum ('nuevo_procedimiento','validacion','rechazo','correccion'); exception when duplicate_object then null; end $$;
do $$ begin create type feed_event_type as enum ('nuevo_registro','procedimiento_validado','hito_becado'); exception when duplicate_object then null; end $$;

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  apellido text not null,
  email text not null unique,
  rol user_role not null default 'becado',
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

create table if not exists public.procedimientos (
  id uuid primary key default uuid_generate_v4(),
  becado_id uuid not null references public.usuarios(id),
  tutor_id uuid not null references public.usuarios(id),
  procedimiento text not null check (procedimiento in ('Intubación','Punción lumbar','Catéter venoso central','Línea arterial','Toracocentesis','Paracentesis','Otro')),
  iniciales_paciente text not null check (char_length(iniciales_paciente) between 2 and 6),
  patologia_contexto text not null,
  dificultad boolean not null,
  exitoso boolean not null,
  complicaciones boolean not null,
  comentario_becado text,
  estado_validacion procedure_status not null default 'pendiente',
  comentario_docente text,
  fecha_hora_registro timestamptz not null default now(),
  fecha_hora_validacion timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.notificaciones (
  id uuid primary key default uuid_generate_v4(),
  usuario_destino_id uuid not null references public.usuarios(id) on delete cascade,
  procedimiento_id uuid references public.procedimientos(id) on delete cascade,
  tipo notification_type not null,
  mensaje text not null,
  leida boolean not null default false,
  fecha_creacion timestamptz not null default now()
);

create table if not exists public.feed (
  id uuid primary key default uuid_generate_v4(),
  procedimiento_id uuid references public.procedimientos(id) on delete cascade,
  tipo_evento feed_event_type not null,
  mensaje text not null,
  visible_para text not null default 'todos' check (visible_para in ('docentes', 'todos')),
  fecha_creacion timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger as $$
begin new.actualizado_en = now(); return new; end; $$ language plpgsql;
drop trigger if exists set_procedimientos_updated_at on public.procedimientos;
create trigger set_procedimientos_updated_at before update on public.procedimientos for each row execute function public.set_updated_at();

create or replace function public.validar_procedimiento(p_procedimiento_id uuid, p_estado procedure_status, p_comentario text default null)
returns void as $$
declare v_becado_id uuid; v_tutor_id uuid; v_procedimiento text; v_becado_nombre text; v_becado_apellido text; v_tutor_nombre text; v_tutor_apellido text;
begin
  select pr.becado_id, pr.tutor_id, pr.procedimiento, ub.nombre, ub.apellido, ut.nombre, ut.apellido
  into v_becado_id, v_tutor_id, v_procedimiento, v_becado_nombre, v_becado_apellido, v_tutor_nombre, v_tutor_apellido
  from public.procedimientos pr join public.usuarios ub on ub.id = pr.becado_id join public.usuarios ut on ut.id = pr.tutor_id
  where pr.id = p_procedimiento_id;
  update public.procedimientos set estado_validacion = p_estado, comentario_docente = p_comentario, fecha_hora_validacion = now() where id = p_procedimiento_id;
  if p_estado = 'validado' then
    insert into public.feed (procedimiento_id,tipo_evento,mensaje,visible_para) values (p_procedimiento_id,'procedimiento_validado','✅ ' || v_becado_nombre || ' ' || v_becado_apellido || ' completó ' || v_procedimiento || ' validado por tutor. ¡Buen avance!','todos');
    insert into public.notificaciones (usuario_destino_id,procedimiento_id,tipo,mensaje) values (v_becado_id,p_procedimiento_id,'validacion','Tu procedimiento fue validado por ' || v_tutor_nombre || ' ' || v_tutor_apellido || '. Buen avance.');
  elsif p_estado = 'rechazado' then
    insert into public.notificaciones (usuario_destino_id,procedimiento_id,tipo,mensaje) values (v_becado_id,p_procedimiento_id,'rechazo','Tu registro fue rechazado por el tutor. Revisa el comentario docente.');
  elsif p_estado = 'correccion_solicitada' then
    insert into public.notificaciones (usuario_destino_id,procedimiento_id,tipo,mensaje) values (v_becado_id,p_procedimiento_id,'correccion','Tu registro requiere corrección. Revisa el comentario docente.');
  end if;
end; $$ language plpgsql security definer;

create or replace function public.notificar_nuevo_procedimiento() returns trigger as $$
declare v_becado_nombre text; v_becado_apellido text;
begin
  select nombre, apellido into v_becado_nombre, v_becado_apellido from public.usuarios where id = new.becado_id;
  insert into public.notificaciones (usuario_destino_id, procedimiento_id, tipo, mensaje) values (new.tutor_id, new.id, 'nuevo_procedimiento', v_becado_nombre || ' ' || v_becado_apellido || ' registró ' || new.procedimiento || '. Pendiente de validación.');
  insert into public.feed (procedimiento_id, tipo_evento, mensaje, visible_para) values (new.id, 'nuevo_registro', '📝 Nuevo procedimiento registrado por ' || v_becado_nombre || ' ' || v_becado_apellido || ': ' || new.procedimiento || '.', 'docentes');
  return new;
end; $$ language plpgsql;
drop trigger if exists trigger_notificar_nuevo_procedimiento on public.procedimientos;
create trigger trigger_notificar_nuevo_procedimiento after insert on public.procedimientos for each row execute function public.notificar_nuevo_procedimiento();

alter table public.usuarios enable row level security;
alter table public.procedimientos enable row level security;
alter table public.notificaciones enable row level security;
alter table public.feed enable row level security;

create policy "Usuarios pueden ver su propio perfil" on public.usuarios for select to authenticated using (id = auth.uid());
create policy "Docentes y administradores pueden ver usuarios activos" on public.usuarios for select to authenticated using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol in ('docente','administrador') and u.activo = true));
create policy "Administradores pueden gestionar usuarios" on public.usuarios for all to authenticated using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'administrador')) with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'administrador'));
create policy "Becados pueden crear sus propios procedimientos" on public.procedimientos for insert to authenticated with check (becado_id = auth.uid());
create policy "Becados pueden ver sus propios procedimientos" on public.procedimientos for select to authenticated using (becado_id = auth.uid());
create policy "Docentes pueden ver procedimientos asociados o globales" on public.procedimientos for select to authenticated using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol in ('docente','administrador')));
create policy "Docentes pueden actualizar procedimientos para validar" on public.procedimientos for update to authenticated using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol in ('docente','administrador'))) with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol in ('docente','administrador')));
create policy "Usuarios ven sus propias notificaciones" on public.notificaciones for select to authenticated using (usuario_destino_id = auth.uid());
create policy "Usuarios pueden marcar sus notificaciones como leídas" on public.notificaciones for update to authenticated using (usuario_destino_id = auth.uid()) with check (usuario_destino_id = auth.uid());
create policy "Usuarios autenticados pueden ver feed público" on public.feed for select to authenticated using (visible_para = 'todos');
create policy "Docentes pueden ver feed docente" on public.feed for select to authenticated using (visible_para = 'todos' or exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol in ('docente','administrador')));

create or replace view public.dashboard_becados as
select u.id as becado_id, u.nombre, u.apellido, count(p.id) as total_procedimientos,
count(p.id) filter (where p.estado_validacion = 'validado') as procedimientos_validados,
count(p.id) filter (where p.estado_validacion = 'pendiente') as pendientes,
count(p.id) filter (where p.exitoso = true) as exitosos,
count(p.id) filter (where p.dificultad = true) as con_dificultad,
count(p.id) filter (where p.complicaciones = true) as con_complicaciones,
case when count(p.id)=0 then 0 else round((count(p.id) filter (where p.exitoso = true)::numeric / count(p.id)::numeric) * 100, 1) end as tasa_exito
from public.usuarios u left join public.procedimientos p on p.becado_id = u.id where u.rol = 'becado' group by u.id, u.nombre, u.apellido;

create or replace view public.procedimientos_por_tipo as
select procedimiento, count(*) as total, count(*) filter (where estado_validacion = 'validado') as validados, count(*) filter (where estado_validacion = 'pendiente') as pendientes
from public.procedimientos group by procedimiento order by total desc;
