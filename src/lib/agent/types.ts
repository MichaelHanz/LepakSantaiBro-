import type {
  AnchorImpact,
  CommunalExpenseResult,
  DayPlan,
  EjectionRoute,
  GroupSafeLimit,
  Ledger,
  Member,
} from '../../types';
import type { GhostBlockSplit } from '../engines/itinerary';

export type ToolName =
  | 'get_group_safe_limit'
  | 'propose_communal_expense'
  | 'add_rogue_spend'
  | 'find_ejection_route'
  | 'plan_day'
  | 'set_my_constraints'
  | 'get_ledger_status'
  | 'help';

export interface Intent {
  tool: ToolName;
  args: {
    amount?: number;
    member?: string;
    description?: string;
    max_daily_budget?: number;
    social_battery_hours?: number;
    pace_preference?: 'pacesetter' | 'spectator';
    day?: 'today' | 'tomorrow';
    now?: string;
  };
  confidence: number;
}

export type IntentSource = 'gemini' | 'groq' | 'keyword';

export type ResultCard =
  | { kind: 'safe_limit'; safe_limit: GroupSafeLimit; member_count: number; submitted: number }
  | {
      kind: 'ledger';
      ledger: Ledger;
      member_count: number;
      safe_limit: GroupSafeLimit;
      last_proposal: CommunalExpenseResult | null;
      rogue_owner: Member | null;
    }
  | {
      kind: 'eject';
      member: Member;
      route: EjectionRoute;
      remaining_budget: number;
      anchor_impact: AnchorImpact | null;
    }
  | { kind: 'itinerary'; plan: DayPlan; splits: GhostBlockSplit[] }
  | { kind: 'constraints_saved'; safe_limit: GroupSafeLimit; submitted: number; member_count: number }
  | { kind: 'help'; examples: string[] };

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  card?: ResultCard;
  tool?: ToolName;
  source?: IntentSource;
  pending?: boolean;
}
