-- Review this migration before running it against a live database.
-- users.referred_by_id is the authoritative parent relationship.
-- The transaction locks registrations while repairing closure links.
begin;

lock table users in share mode;
lock table referral_nodes in exclusive mode;

with recursive expected as (
  select id as descendant_id, referred_by_id as ancestor_id, 1 as depth
  from users
  where referred_by_id is not null
  union all
  select expected.descendant_id, parent.referred_by_id, expected.depth + 1
  from expected
  inner join users parent on parent.id = expected.ancestor_id
  where parent.referred_by_id is not null and expected.depth < 10
)
delete from referral_nodes stored
where not exists (
  select 1 from expected
  where expected.ancestor_id = stored.ancestor_id
    and expected.descendant_id = stored.descendant_id
    and expected.depth = stored.depth
);

with recursive expected as (
  select id as descendant_id, referred_by_id as ancestor_id, 1 as depth
  from users
  where referred_by_id is not null
  union all
  select expected.descendant_id, parent.referred_by_id, expected.depth + 1
  from expected
  inner join users parent on parent.id = expected.ancestor_id
  where parent.referred_by_id is not null and expected.depth < 10
)
insert into referral_nodes (ancestor_id, descendant_id, depth)
select ancestor_id, descendant_id, depth
from expected
where not exists (
  select 1 from referral_nodes stored
  where stored.ancestor_id = expected.ancestor_id
    and stored.descendant_id = expected.descendant_id
    and stored.depth = expected.depth
);

commit;
