
create table public.messages (
    id uuid not null default gen_random_uuid() primary key,
    sender_email text not null,
    target_email text not null,
    text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


alter table public.messages enable row level security;


create policy "自分の関わるメッセージのみ閲覧可能"
    on public.messages for select
    to authenticated
    using (
        auth.jwt() ->> 'email' = sender_email OR
        auth.jwt() ->> 'email' = target_email
    );


create policy "自分のメッセージのみ追加可能"
    on public.messages for insert
    to authenticated
    with check (
        auth.jwt() ->> 'email' = sender_email
    );