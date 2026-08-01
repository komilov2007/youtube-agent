-- YouTube Content Agent - Phase 1 database foundation.
--
-- Every application table is protected by RLS. Authenticated users can perform
-- CRUD operations only on rows they own; anonymous clients receive no table
-- privileges. The service_role retains full access for trusted server-only jobs.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.profile_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.channel_platform as enum ('youtube');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.channel_status as enum ('draft', 'active', 'paused', 'error');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.content_source_type as enum ('youtube', 'upload', 'external');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.license_type as enum (
    'owned',
    'creative_commons',
    'licensed',
    'public_domain',
    'permission',
    'unknown'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.license_status as enum ('pending', 'verified', 'rejected', 'expired');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.content_status as enum (
    'draft',
    'pending_approval',
    'approved',
    'scheduled',
    'publishing',
    'published',
    'failed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.log_level as enum ('debug', 'info', 'warning', 'error');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_check check (
    char_length(email) between 3 and 320
    and email = btrim(email)
  ),
  constraint profiles_full_name_check check (
    full_name is null
    or (char_length(btrim(full_name)) between 1 and 120 and full_name = btrim(full_name))
  ),
  constraint profiles_avatar_url_check check (
    avatar_url is null
    or (char_length(avatar_url) <= 2048 and avatar_url ~* '^https?://')
  )
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform public.channel_platform not null default 'youtube',
  status public.channel_status not null default 'draft',
  youtube_channel_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint channels_name_check check (
    char_length(btrim(name)) between 1 and 120
    and name = btrim(name)
  ),
  constraint channels_youtube_channel_id_check check (
    youtube_channel_id is null
    or (char_length(btrim(youtube_channel_id)) between 1 and 128 and youtube_channel_id = btrim(youtube_channel_id))
  ),
  constraint channels_user_name_key unique (user_id, name),
  constraint channels_user_youtube_channel_id_key unique (user_id, youtube_channel_id)
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  source_url text not null,
  source_type public.content_source_type not null,
  license_type public.license_type not null,
  license_status public.license_status not null default 'pending',
  attribution_text text,
  evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sources_name_check check (
    char_length(btrim(name)) between 1 and 160
    and name = btrim(name)
  ),
  constraint content_sources_source_url_check check (
    char_length(source_url) <= 2048
    and source_url ~* '^https?://'
  ),
  constraint content_sources_attribution_text_check check (
    attribution_text is null or char_length(attribution_text) <= 2000
  ),
  constraint content_sources_evidence_url_check check (
    evidence_url is null
    or (char_length(evidence_url) <= 2048 and evidence_url ~* '^https?://')
  ),
  constraint content_sources_user_source_url_key unique (user_id, source_url)
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete set null,
  source_id uuid references public.content_sources (id) on delete set null,
  title text not null,
  description text,
  status public.content_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  external_video_id text,
  source_url text,
  license_status public.license_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_items_title_check check (
    char_length(btrim(title)) between 1 and 100
    and title = btrim(title)
  ),
  constraint content_items_description_check check (
    description is null or char_length(description) <= 5000
  ),
  constraint content_items_external_video_id_check check (
    external_video_id is null
    or (char_length(btrim(external_video_id)) between 1 and 128 and external_video_id = btrim(external_video_id))
  ),
  constraint content_items_source_url_check check (
    source_url is null
    or (char_length(source_url) <= 2048 and source_url ~* '^https?://')
  )
);

create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  level public.log_level not null default 'info',
  event text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint automation_logs_event_check check (
    char_length(btrim(event)) between 1 and 160
    and event = btrim(event)
  ),
  constraint automation_logs_message_check check (
    char_length(btrim(message)) between 1 and 4000
  ),
  constraint automation_logs_metadata_check check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  timezone text not null default 'UTC',
  language text not null default 'en',
  daily_publish_limit integer not null default 1,
  automation_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_user_id_key unique (user_id),
  constraint app_settings_timezone_check check (
    char_length(btrim(timezone)) between 1 and 100
    and timezone = btrim(timezone)
  ),
  constraint app_settings_language_check check (
    language ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
  ),
  constraint app_settings_daily_publish_limit_check check (
    daily_publish_limit between 0 and 50
  )
);

-- Tenant and common filtering indexes. Partial indexes keep nullable queue fields compact.
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

create index if not exists channels_user_id_idx on public.channels (user_id);
create index if not exists channels_status_idx on public.channels (status);
create index if not exists channels_created_at_idx on public.channels (created_at desc);

create index if not exists content_sources_user_id_idx on public.content_sources (user_id);
create index if not exists content_sources_license_status_idx on public.content_sources (license_status);
create index if not exists content_sources_created_at_idx on public.content_sources (created_at desc);

create index if not exists content_items_user_id_idx on public.content_items (user_id);
create index if not exists content_items_channel_id_idx on public.content_items (channel_id);
create index if not exists content_items_source_id_idx on public.content_items (source_id);
create index if not exists content_items_status_idx on public.content_items (status);
create index if not exists content_items_scheduled_at_idx
  on public.content_items (scheduled_at)
  where scheduled_at is not null;
create index if not exists content_items_created_at_idx on public.content_items (created_at desc);
create index if not exists content_items_external_video_id_idx
  on public.content_items (external_video_id)
  where external_video_id is not null;
create unique index if not exists content_items_user_external_video_id_key
  on public.content_items (user_id, external_video_id)
  where external_video_id is not null;

create index if not exists automation_logs_user_id_idx on public.automation_logs (user_id);
create index if not exists automation_logs_created_at_idx on public.automation_logs (created_at desc);
create index if not exists automation_logs_level_idx on public.automation_logs (level);

create index if not exists app_settings_created_at_idx on public.app_settings (created_at desc);

-- Keep updated_at server-controlled and consistent on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists channels_set_updated_at on public.channels;
create trigger channels_set_updated_at
before update on public.channels
for each row execute function public.set_updated_at();

drop trigger if exists content_sources_set_updated_at on public.content_sources;
create trigger content_sources_set_updated_at
before update on public.content_sources
for each row execute function public.set_updated_at();

drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at
before update on public.content_items
for each row execute function public.set_updated_at();

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- A queue item may reference only a channel/source owned by the same user.
-- RLS hides foreign rows, while this trigger also guarantees relational integrity
-- for trusted server-side writes that bypass RLS.
create or replace function public.validate_content_item_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.channel_id is not null and not exists (
    select 1
    from public.channels
    where id = new.channel_id and user_id = new.user_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'channel_id must reference a channel owned by user_id';
  end if;

  if new.source_id is not null and not exists (
    select 1
    from public.content_sources
    where id = new.source_id and user_id = new.user_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'source_id must reference a content source owned by user_id';
  end if;

  return new;
end;
$$;

drop trigger if exists content_items_validate_ownership on public.content_items;
create trigger content_items_validate_ownership
before insert or update of user_id, channel_id, source_id on public.content_items
for each row execute function public.validate_content_item_ownership();

-- Supabase Auth profile provisioning. Authorization role is deliberately never
-- copied from user metadata, preventing metadata-based privilege escalation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    btrim(new.email),
    left(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 120),
    case
      when char_length(btrim(new.raw_user_meta_data ->> 'avatar_url')) <= 2048
        and btrim(new.raw_user_meta_data ->> 'avatar_url') ~* '^https?://'
      then btrim(new.raw_user_meta_data ->> 'avatar_url')
      else null
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Initial deployments can already contain Auth users. Backfill their profiles
-- once so applying this migration is safe for an established development project.
insert into public.profiles (id, email, full_name, avatar_url)
select
  users.id,
  btrim(users.email),
  left(nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''), 120),
  case
    when char_length(btrim(users.raw_user_meta_data ->> 'avatar_url')) <= 2048
      and btrim(users.raw_user_meta_data ->> 'avatar_url') ~* '^https?://'
    then btrim(users.raw_user_meta_data ->> 'avatar_url')
    else null
  end
from auth.users as users
where users.email is not null
on conflict (id) do nothing;

-- Keep the public profile email aligned when an authenticated user confirms an
-- email change through Supabase Auth. Other profile fields remain user-managed.
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null and new.email is distinct from old.email then
    update public.profiles
    set email = btrim(new.email)
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.handle_user_email_update();

alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.content_sources enable row level security;
alter table public.content_items enable row level security;
alter table public.automation_logs enable row level security;
alter table public.app_settings enable row level security;

alter table public.profiles force row level security;
alter table public.channels force row level security;
alter table public.content_sources force row level security;
alter table public.content_items force row level security;
alter table public.automation_logs force row level security;
alter table public.app_settings force row level security;

-- Profile policies: a profile is visible and mutable only to its auth user.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id and role = 'user');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

-- Channels CRUD policies.
drop policy if exists "channels_select_own" on public.channels;
create policy "channels_select_own"
on public.channels for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "channels_insert_own" on public.channels;
create policy "channels_insert_own"
on public.channels for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "channels_update_own" on public.channels;
create policy "channels_update_own"
on public.channels for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "channels_delete_own" on public.channels;
create policy "channels_delete_own"
on public.channels for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Content source CRUD policies.
drop policy if exists "content_sources_select_own" on public.content_sources;
create policy "content_sources_select_own"
on public.content_sources for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "content_sources_insert_own" on public.content_sources;
create policy "content_sources_insert_own"
on public.content_sources for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "content_sources_update_own" on public.content_sources;
create policy "content_sources_update_own"
on public.content_sources for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "content_sources_delete_own" on public.content_sources;
create policy "content_sources_delete_own"
on public.content_sources for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Content queue CRUD policies.
drop policy if exists "content_items_select_own" on public.content_items;
create policy "content_items_select_own"
on public.content_items for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "content_items_insert_own" on public.content_items;
create policy "content_items_insert_own"
on public.content_items for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "content_items_update_own" on public.content_items;
create policy "content_items_update_own"
on public.content_items for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "content_items_delete_own" on public.content_items;
create policy "content_items_delete_own"
on public.content_items for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Automation log CRUD policies.
drop policy if exists "automation_logs_select_own" on public.automation_logs;
create policy "automation_logs_select_own"
on public.automation_logs for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "automation_logs_insert_own" on public.automation_logs;
create policy "automation_logs_insert_own"
on public.automation_logs for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "automation_logs_update_own" on public.automation_logs;
create policy "automation_logs_update_own"
on public.automation_logs for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "automation_logs_delete_own" on public.automation_logs;
create policy "automation_logs_delete_own"
on public.automation_logs for delete
to authenticated
using ((select auth.uid()) = user_id);

-- A single settings row is allowed per user, with full owner-only CRUD.
drop policy if exists "app_settings_select_own" on public.app_settings;
create policy "app_settings_select_own"
on public.app_settings for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "app_settings_insert_own" on public.app_settings;
create policy "app_settings_insert_own"
on public.app_settings for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "app_settings_update_own" on public.app_settings;
create policy "app_settings_update_own"
on public.app_settings for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "app_settings_delete_own" on public.app_settings;
create policy "app_settings_delete_own"
on public.app_settings for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit grants pair with RLS. Profile role/email remain server-controlled:
-- users may update only presentational profile fields through the public API.
revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.channels from public, anon, authenticated;
revoke all on table public.content_sources from public, anon, authenticated;
revoke all on table public.content_items from public, anon, authenticated;
revoke all on table public.automation_logs from public, anon, authenticated;
revoke all on table public.app_settings from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;

grant select, insert, update, delete on table public.channels to authenticated;
grant select, insert, update, delete on table public.content_sources to authenticated;
grant select, insert, update, delete on table public.content_items to authenticated;
grant select, insert, update, delete on table public.automation_logs to authenticated;
grant select, insert, update, delete on table public.app_settings to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.channels to service_role;
grant all on table public.content_sources to service_role;
grant all on table public.content_items to service_role;
grant all on table public.automation_logs to service_role;
grant all on table public.app_settings to service_role;

-- Update profile and application preferences in one database transaction.
-- SECURITY INVOKER preserves the caller's RLS checks and column grants.
create or replace function public.update_my_settings(
  p_full_name text,
  p_timezone text,
  p_language text,
  p_daily_publish_limit integer,
  p_automation_enabled boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  update public.profiles
  set full_name = nullif(btrim(p_full_name), '')
  where id = current_user_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Profile not found';
  end if;

  insert into public.app_settings (
    user_id,
    timezone,
    language,
    daily_publish_limit,
    automation_enabled
  )
  values (
    current_user_id,
    p_timezone,
    p_language,
    p_daily_publish_limit,
    p_automation_enabled
  )
  on conflict (user_id) do update
  set
    timezone = excluded.timezone,
    language = excluded.language,
    daily_publish_limit = excluded.daily_publish_limit,
    automation_enabled = excluded.automation_enabled;
end;
$$;

revoke all on function public.update_my_settings(text, text, text, integer, boolean) from public, anon;
grant execute on function public.update_my_settings(text, text, text, integer, boolean) to authenticated, service_role;

revoke all on function public.set_updated_at() from public;
revoke all on function public.validate_content_item_ownership() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_user_email_update() from public;

comment on table public.profiles is
  'Private application profiles. RLS permits access only when auth.uid() equals id.';
comment on column public.profiles.role is
  'Authorization role controlled only by trusted server/database processes.';
comment on table public.channels is
  'User-owned publishing channel records; Phase 1 does not store OAuth credentials.';
comment on table public.content_sources is
  'User-owned source provenance and licensing evidence; no media is downloaded.';
comment on table public.content_items is
  'User-owned approval and publishing queue foundation.';
comment on table public.automation_logs is
  'User-scoped structured automation audit events.';
comment on table public.app_settings is
  'One user-owned application settings row per auth user.';
comment on function public.validate_content_item_ownership() is
  'Rejects cross-tenant channel/source references on content items.';
comment on function public.handle_new_user() is
  'Creates a private profile for each newly inserted Supabase Auth user.';
comment on function public.update_my_settings(text, text, text, integer, boolean) is
  'Atomically updates the authenticated user profile and application preferences under RLS.';
