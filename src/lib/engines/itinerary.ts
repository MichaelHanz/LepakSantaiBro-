import type {
  AnchorNode,
  DayPlan,
  GhostActivity,
  GhostBlock,
  Member,
  GroupSafeLimit,
  PacePreference,
} from '../../types';
import { parseClockMinutes } from './eject';

export interface TaggedActivity extends GhostActivity {
  pace: PacePreference;
}

export interface ActivityPool {
  anchors: AnchorNode[];
  ghost_windows: { start: string; end: string }[];
  activities: TaggedActivity[];
}

/** Anchor nodes are the only mandatory shared hours (SPEC.md 2.2). */
export function groupHoursForAnchors(anchors: AnchorNode[], hoursPerAnchor = 1.5): number {
  return anchors.length * hoursPerAnchor;
}

function pickActivity(
  activities: TaggedActivity[],
  pace: PacePreference,
  index: number,
): GhostActivity {
  const matching = activities.filter((activity) => activity.pace === pace);
  const chosen = matching[index % Math.max(1, matching.length)];
  return chosen ?? { type: 'free time', location: 'wherever you land', estimated_cost: 0 };
}

/**
 * SPEC.md 2.2 — 2-3 mandatory anchor nodes with deliberately split ghost blocks
 * in between. Anchors are trimmed so mandatory shared hours never exceed the
 * group's `max_group_hours` (the lowest social battery in the group).
 */
export function buildDayPlan(
  day: number,
  pool: ActivityPool,
  safeLimit: GroupSafeLimit,
  hoursPerAnchor = 1.5,
): DayPlan {
  const maxAnchors = Math.max(
    1,
    Math.min(pool.anchors.length, Math.floor(safeLimit.max_group_hours / hoursPerAnchor)),
  );
  const anchors = [...pool.anchors]
    .sort((a, b) => parseClockMinutes(a.time) - parseClockMinutes(b.time))
    .slice(0, maxAnchors);

  const ghostBlocks: GhostBlock[] = pool.ghost_windows.map((window, index) => ({
    start: window.start,
    end: window.end,
    pacesetter_activity: pickActivity(pool.activities, 'pacesetter', index),
    spectator_activity: pickActivity(pool.activities, 'spectator', index),
  }));

  return { day, anchor_nodes: anchors, ghost_blocks: ghostBlocks };
}

export function activityForMember(block: GhostBlock, member: Member): GhostActivity {
  return member.pace_preference === 'pacesetter'
    ? block.pacesetter_activity
    : block.spectator_activity;
}

export interface GhostBlockSplit {
  block: GhostBlock;
  pacesetters: Member[];
  spectators: Member[];
}

/** Fission: split each ghost block by the members' own pace preference. */
export function splitGhostBlocks(plan: DayPlan, members: Member[]): GhostBlockSplit[] {
  return plan.ghost_blocks.map((block) => ({
    block,
    pacesetters: members.filter((m) => m.pace_preference === 'pacesetter'),
    spectators: members.filter((m) => m.pace_preference === 'spectator'),
  }));
}

/** Fusion: the next anchor node after `nowMinutes`, where the group re-merges. */
export function nextAnchorNode(plan: DayPlan, nowMinutes: number): AnchorNode | null {
  const upcoming = plan.anchor_nodes
    .filter((anchor) => parseClockMinutes(anchor.time) >= nowMinutes)
    .sort((a, b) => parseClockMinutes(a.time) - parseClockMinutes(b.time));
  return upcoming[0] ?? null;
}
