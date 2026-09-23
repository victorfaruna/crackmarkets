CREATE TABLE "binary_placements" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"parent_user_id" uuid NOT NULL,
	"side" varchar(5) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "binary_placements_side_check" CHECK ("binary_placements"."side" in ('LEFT', 'RIGHT')),
	CONSTRAINT "binary_placements_no_self_parent" CHECK ("binary_placements"."user_id" <> "binary_placements"."parent_user_id")
);
--> statement-breakpoint
ALTER TABLE "binary_placements" ADD CONSTRAINT "binary_placements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "binary_placements" ADD CONSTRAINT "binary_placements_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "binary_placements_parent_side_unique" ON "binary_placements" USING btree ("parent_user_id","side");--> statement-breakpoint
CREATE INDEX "binary_placements_parent_idx" ON "binary_placements" USING btree ("parent_user_id");--> statement-breakpoint
DO $$
BEGIN
  PERFORM pg_advisory_xact_lock(7461930);
  -- Preserve sponsorship. Assign existing users stable breadth-first positions
  -- within their sponsorship root's tree, oldest registration first.
  WITH RECURSIVE referral_tree AS (
    SELECT id AS user_id, id AS root_id, created_at
    FROM users
    WHERE referred_by_id IS NULL
    UNION ALL
    SELECT child.id, parent.root_id, child.created_at
    FROM users child
    JOIN referral_tree parent ON child.referred_by_id = parent.user_id
  ), ranked AS (
    SELECT user_id, root_id,
      row_number() OVER (PARTITION BY root_id ORDER BY created_at, user_id) + 1 AS heap_index
    FROM referral_tree
    WHERE user_id <> root_id
  ), heap AS (
    SELECT id AS user_id, id AS root_id, 1::bigint AS heap_index
    FROM users
    WHERE referred_by_id IS NULL
    UNION ALL
    SELECT user_id, root_id, heap_index FROM ranked
  )
  INSERT INTO binary_placements (user_id, parent_user_id, side)
  SELECT child.user_id, parent.user_id,
    CASE WHEN child.heap_index % 2 = 0 THEN 'LEFT' ELSE 'RIGHT' END
  FROM heap child
  JOIN heap parent
    ON parent.root_id = child.root_id
   AND parent.heap_index = child.heap_index / 2
  WHERE child.heap_index > 1;

  IF EXISTS (
    SELECT 1 FROM users u
    WHERE u.referred_by_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM binary_placements p WHERE p.user_id = u.id)
  ) THEN
    RAISE EXCEPTION 'Some referred users could not be assigned binary positions; check referral parent cycles';
  END IF;
END $$;
