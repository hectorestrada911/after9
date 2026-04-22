alter table if exists events
  add column if not exists show_capacity_publicly boolean not null default false;
