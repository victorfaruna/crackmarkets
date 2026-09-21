-- Review before running against a live database. Adds zero-balance wallets
-- only for existing users who have no wallet. Existing balances are untouched.
begin;

insert into wallets (
  user_id,
  balance,
  available_balance,
  total_withdrawn,
  lifetime_earnings
)
select
  users.id,
  0,
  0,
  0,
  0
from users
where not exists (
  select 1 from wallets where wallets.user_id = users.id
)
on conflict (user_id) do nothing;

commit;
