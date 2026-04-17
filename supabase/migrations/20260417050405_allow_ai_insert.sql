drop policy if exists "自分のメッセージのみ追加可能" on public.messages;

create policy "自分またはAIの返信を保存可能"
on public.messages for insert
to authenticated
with check (
  auth.jwt() ->> 'email' = sender_email
  OR
  (sender_email = 'ai@local' AND target_email = auth.jwt() ->> 'email')
);