import type { ResultCard, Intent, ToolName } from './types';
import type { EjectEvent, Member } from '../../types';
import { currentMember, findMember, type TripState } from '../../state/tripState';
import {
  addRogueSpend,
  calculateGroupSafeLimit,
  buildDayPlan,
  evaluateAnchorImpact,
  findEjectionRoute,
  nextAnchorNode,
  proposeCommunalExpense,
  remainingBudgetFor,
  splitGhostBlocks,
  totalRogueSpend,
} from '../engines';
import {
  DEMO_USER_LOCATION,
  KL_ACTIVITY_POOL,
  KL_SANCTUARY_NODES,
} from '../../data/demo';

export interface ToolOutcome {
  state: TripState;
  tool: ToolName;
  /** Deterministic facts handed to the LLM for narration — never recomputed by it. */
  facts: string;
  fallbackText: string;
  card?: ResultCard;
}

const money = (value: number) => `RM ${value.toFixed(2).replace(/\.00$/, '')}`;

export const HELP_EXAMPLES = [
  'eject Aina',
  'add RM 60 for dinner',
  'log RM 18 rogue spend for me',
  'set my daily budget to 90',
  "what's our safe limit",
  "plan tomorrow's ghost blocks",
];

function minutesOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

function resolveMember(state: TripState, query: string | undefined): Member {
  if (!query || query === 'me') return currentMember(state);
  return findMember(state, query) ?? currentMember(state);
}

function safeLimitTool(state: TripState): ToolOutcome {
  const safeLimit = calculateGroupSafeLimit(state.members);
  return {
    state,
    tool: 'get_group_safe_limit',
    facts: `daily_budget_ceiling=${safeLimit.daily_budget_ceiling}; max_group_hours=${safeLimit.max_group_hours}; members=${state.members.length}; aggregation=min`,
    fallbackText: `Group Safe Limit is ${money(safeLimit.daily_budget_ceiling)} per person per day and ${safeLimit.max_group_hours}h of group time. Taken as the minimum across the group — nobody sees whose numbers set it.`,
    card: {
      kind: 'safe_limit',
      safe_limit: safeLimit,
      member_count: state.members.length,
      submitted: state.submitted_member_ids.length,
    },
  };
}

function ledgerStatusTool(state: TripState): ToolOutcome {
  const safeLimit = calculateGroupSafeLimit(state.members);
  const rogue = totalRogueSpend(state.ledger);
  return {
    state,
    tool: 'get_ledger_status',
    facts: `communal_burn_rate=${state.ledger.communal_burn_rate}; communal_per_member=${(state.ledger.communal_burn_rate / state.members.length).toFixed(2)}; rogue_total=${rogue}; ceiling=${safeLimit.daily_budget_ceiling}`,
    fallbackText: `Communal burn is ${money(state.ledger.communal_burn_rate)} (${money(state.ledger.communal_burn_rate / state.members.length)} each) and rogue spend totals ${money(rogue)}. The two never mix.`,
    card: {
      kind: 'ledger',
      ledger: state.ledger,
      member_count: state.members.length,
      safe_limit: safeLimit,
      last_proposal: null,
      rogue_owner: null,
    },
  };
}

function communalExpenseTool(state: TripState, intent: Intent): ToolOutcome {
  const amount = intent.args.amount;
  if (amount === undefined || amount <= 0) {
    return {
      state,
      tool: 'propose_communal_expense',
      facts: 'missing_amount=true',
      fallbackText: 'How much is it? Give me an amount, like "add RM 60 for the Grab".',
    };
  }

  const safeLimit = calculateGroupSafeLimit(state.members);
  const result = proposeCommunalExpense(state.ledger, amount, safeLimit, state.members.length);
  const label = intent.args.description ? ` for ${intent.args.description}` : '';

  return {
    state: { ...state, ledger: result.ledger },
    tool: 'propose_communal_expense',
    facts: `approved=${result.approved}; amount=${amount}; per_member_share=${result.per_member_share.toFixed(2)}; communal_total=${result.ledger.communal_burn_rate}; ceiling=${safeLimit.daily_budget_ceiling}${result.reason ? `; reason=${result.reason}` : ''}`,
    fallbackText: result.approved
      ? `Added ${money(amount)}${label} to the communal ledger — ${money(result.per_member_share)} each.`
      : `Blocked: ${money(result.per_member_share)} each${label} would push the day past ${money(safeLimit.daily_budget_ceiling)} — ${result.reason}.`,
    card: {
      kind: 'ledger',
      ledger: result.ledger,
      member_count: state.members.length,
      safe_limit: safeLimit,
      last_proposal: result,
      rogue_owner: null,
    },
  };
}

function rogueSpendTool(state: TripState, intent: Intent): ToolOutcome {
  const amount = intent.args.amount;
  const member = resolveMember(state, intent.args.member);
  if (amount === undefined || amount <= 0) {
    return {
      state,
      tool: 'add_rogue_spend',
      facts: 'missing_amount=true',
      fallbackText: 'Tell me the amount and I will keep it on your personal ledger only.',
    };
  }

  const ledger = addRogueSpend(state.ledger, member.user_id, amount);
  const safeLimit = calculateGroupSafeLimit(state.members);

  return {
    state: { ...state, ledger },
    tool: 'add_rogue_spend',
    facts: `member=${member.display_name}; amount=${amount}; member_rogue_total=${ledger.rogue_spend[member.user_id]}; communal_unchanged=${ledger.communal_burn_rate}`,
    fallbackText: `${money(amount)} logged as ${member.display_name === 'You' ? 'your' : `${member.display_name}'s`} rogue spend. The communal total is untouched at ${money(ledger.communal_burn_rate)}.`,
    card: {
      kind: 'ledger',
      ledger,
      member_count: state.members.length,
      safe_limit: safeLimit,
      last_proposal: null,
      rogue_owner: member,
    },
  };
}

function ejectTool(state: TripState, intent: Intent, now: Date): ToolOutcome {
  const member = resolveMember(state, intent.args.member);
  const safeLimit = calculateGroupSafeLimit(state.members);
  const remainingBudget = remainingBudgetFor(
    state.ledger,
    member.user_id,
    state.members.length,
    safeLimit,
  );
  const route = findEjectionRoute(DEMO_USER_LOCATION, KL_SANCTUARY_NODES, remainingBudget);

  if (!route) {
    return {
      state,
      tool: 'find_ejection_route',
      facts: 'candidates=0',
      fallbackText: 'No sanctuary nodes are loaded for this city yet, so I cannot reroute anyone.',
    };
  }

  const anchor = nextAnchorNode(state.plan, minutesOfDay(now));
  const anchorImpact = evaluateAnchorImpact(route, anchor, minutesOfDay(now));

  const event: EjectEvent = {
    id: `eject-${now.getTime()}`,
    member_id: member.user_id,
    trigger_reason: intent.args.description ?? 'member requested an eject',
    chosen_sanctuary_node: route.node,
    triggered_at: now.toISOString(),
    anchor_impact: anchorImpact,
  };

  const anchorNote = anchorImpact
    ? anchorImpact.can_make_anchor
      ? ` Still makes the ${anchorImpact.anchor.time} ${anchorImpact.anchor.activity.toLowerCase()}.`
      : ` Will not make the ${anchorImpact.anchor.time} ${anchorImpact.anchor.activity.toLowerCase()} — suggest moving it to ${anchorImpact.suggested_anchor_time}.`
    : '';

  return {
    state: { ...state, eject_events: [...state.eject_events, event] },
    tool: 'find_ejection_route',
    facts: `member=${member.display_name}; sanctuary=${route.node.name}; travel_time_minutes=${route.node.travel_time_minutes}; distance_km=${route.node.distance_km}; cost=${route.node.estimated_cost}; score=${route.score.toFixed(2)}; outcome=${route.outcome}; remaining_budget=${remainingBudget.toFixed(2)}; anchor_ok=${anchorImpact?.can_make_anchor ?? 'n/a'}`,
    fallbackText: `${member.display_name} is rerouted to ${route.node.name} — ${route.node.travel_time_minutes} min, ${money(route.node.estimated_cost)}, ${route.node.distance_km} km.${anchorNote}`,
    card: {
      kind: 'eject',
      member,
      route,
      remaining_budget: remainingBudget,
      anchor_impact: anchorImpact,
    },
  };
}

function planDayTool(state: TripState): ToolOutcome {
  const safeLimit = calculateGroupSafeLimit(state.members);
  const plan = buildDayPlan(state.plan.day, KL_ACTIVITY_POOL, safeLimit);
  const splits = splitGhostBlocks(plan, state.members);

  return {
    state: { ...state, plan },
    tool: 'plan_day',
    facts: `anchors=${plan.anchor_nodes.length}; ghost_blocks=${plan.ghost_blocks.length}; max_group_hours=${safeLimit.max_group_hours}`,
    fallbackText: `Day ${plan.day}: ${plan.anchor_nodes.length} anchor nodes holding the group together, ${plan.ghost_blocks.length} ghost blocks split by pace.`,
    card: { kind: 'itinerary', plan, splits },
  };
}

function setConstraintsTool(state: TripState, intent: Intent): ToolOutcome {
  const me = currentMember(state);
  const updated: Member = {
    ...me,
    max_daily_budget: intent.args.max_daily_budget ?? me.max_daily_budget,
    social_battery_hours: intent.args.social_battery_hours ?? me.social_battery_hours,
    pace_preference: intent.args.pace_preference ?? me.pace_preference,
  };
  const members = state.members.map((m) => (m.user_id === me.user_id ? updated : m));
  const safeLimit = calculateGroupSafeLimit(members);
  const submitted = state.submitted_member_ids.includes(me.user_id)
    ? state.submitted_member_ids
    : [...state.submitted_member_ids, me.user_id];

  return {
    state: { ...state, members, submitted_member_ids: submitted },
    tool: 'set_my_constraints',
    facts: `updated_privately=true; new_ceiling=${safeLimit.daily_budget_ceiling}; new_max_group_hours=${safeLimit.max_group_hours}`,
    fallbackText: `Saved privately. The group now sees only the aggregate: ${money(safeLimit.daily_budget_ceiling)} per day and ${safeLimit.max_group_hours}h together.`,
    card: {
      kind: 'constraints_saved',
      safe_limit: safeLimit,
      submitted: submitted.length,
      member_count: members.length,
    },
  };
}

function helpTool(state: TripState): ToolOutcome {
  return {
    state,
    tool: 'help',
    facts: 'tool=help',
    fallbackText: 'I mediate the money and the pace. Try one of these.',
    card: { kind: 'help', examples: HELP_EXAMPLES },
  };
}

/** All ledger and eject math runs here, deterministically — never in the LLM. */
export function runTool(state: TripState, intent: Intent, now: Date = new Date()): ToolOutcome {
  switch (intent.tool) {
    case 'get_group_safe_limit':
      return safeLimitTool(state);
    case 'get_ledger_status':
      return ledgerStatusTool(state);
    case 'propose_communal_expense':
      return communalExpenseTool(state, intent);
    case 'add_rogue_spend':
      return rogueSpendTool(state, intent);
    case 'find_ejection_route':
      return ejectTool(state, intent, now);
    case 'plan_day':
      return planDayTool(state);
    case 'set_my_constraints':
      return setConstraintsTool(state, intent);
    case 'help':
    default:
      return helpTool(state);
  }
}
