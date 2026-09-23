-- One-time repair for referred users without a binary placement.
-- Keep every sponsored member inside their sponsor's placement branch.
-- The DO statement is atomic and shares the registration advisory lock.
DO $$
DECLARE
  candidate record;
  available_position record;
  invalid_placement boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(7461930);

  FOR candidate IN
    WITH RECURSIVE sponsor_tree AS (
      SELECT id AS user_id, 0 AS depth, ARRAY[id] AS visited
      FROM users
      WHERE referred_by_id IS NULL
      UNION ALL
      SELECT child.id, sponsor_tree.depth + 1,
        sponsor_tree.visited || child.id
      FROM users child
      JOIN sponsor_tree ON child.referred_by_id = sponsor_tree.user_id
      WHERE NOT child.id = ANY(sponsor_tree.visited)
    )
    SELECT member.id, member.referred_by_id, sponsor_tree.depth
    FROM sponsor_tree
    JOIN users member ON member.id = sponsor_tree.user_id
    WHERE member.referred_by_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM binary_placements placement
        WHERE placement.user_id = member.id
      )
    ORDER BY sponsor_tree.depth, member.created_at, member.id
  LOOP
    WITH RECURSIVE sponsor_branch AS (
      SELECT candidate.referred_by_id AS user_id, ''::text AS path,
        0 AS depth, ARRAY[candidate.referred_by_id] AS visited
      UNION ALL
      SELECT child.user_id,
        sponsor_branch.path || CASE child.side WHEN 'LEFT' THEN '0' ELSE '1' END,
        sponsor_branch.depth + 1,
        sponsor_branch.visited || child.user_id
      FROM binary_placements child
      JOIN sponsor_branch ON child.parent_user_id = sponsor_branch.user_id
      WHERE NOT child.user_id = ANY(sponsor_branch.visited)
    )
    SELECT sponsor_branch.user_id AS parent_user_id,
      CASE WHEN left_slot.user_id IS NULL THEN 'LEFT' ELSE 'RIGHT' END AS side
    INTO available_position
    FROM sponsor_branch
    LEFT JOIN binary_placements left_slot
      ON left_slot.parent_user_id = sponsor_branch.user_id
      AND left_slot.side = 'LEFT'
    LEFT JOIN binary_placements right_slot
      ON right_slot.parent_user_id = sponsor_branch.user_id
      AND right_slot.side = 'RIGHT'
    WHERE left_slot.user_id IS NULL OR right_slot.user_id IS NULL
    ORDER BY sponsor_branch.depth, sponsor_branch.path
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No binary position available for sponsored user %', candidate.id;
    END IF;

    INSERT INTO binary_placements (user_id, parent_user_id, side)
    VALUES (candidate.id, available_position.parent_user_id, available_position.side);
  END LOOP;

  WITH RECURSIVE placement_reach AS (
    SELECT parent_user_id AS ancestor_id, user_id AS descendant_id,
      ARRAY[parent_user_id, user_id] AS visited
    FROM binary_placements
    UNION ALL
    SELECT placement_reach.ancestor_id, child.user_id,
      placement_reach.visited || child.user_id
    FROM placement_reach
    JOIN binary_placements child
      ON child.parent_user_id = placement_reach.descendant_id
    WHERE NOT child.user_id = ANY(placement_reach.visited)
  )
  SELECT EXISTS (
    SELECT 1 FROM users member
    WHERE member.referred_by_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM placement_reach
        WHERE placement_reach.ancestor_id = member.referred_by_id
          AND placement_reach.descendant_id = member.id
      )
  ) INTO invalid_placement;

  IF invalid_placement THEN
    RAISE EXCEPTION 'Some sponsored users are outside their sponsor branch or remain unplaced';
  END IF;
END $$;
