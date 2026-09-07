import type { ResultCard } from '../../lib/agent/types';
import { EjectRouteCard } from './EjectRouteCard';
import { HelpCard } from './HelpCard';
import { ItineraryCard } from './ItineraryCard';
import { LedgerCard } from './LedgerCard';
import { SafeLimitCard } from './SafeLimitCard';

interface Props {
  card: ResultCard;
  onPickExample?: (example: string) => void;
}

export function ResultCardView({ card, onPickExample }: Props) {
  switch (card.kind) {
    case 'safe_limit':
      return (
        <SafeLimitCard
          safeLimit={card.safe_limit}
          memberCount={card.member_count}
          submitted={card.submitted}
        />
      );
    case 'constraints_saved':
      return (
        <SafeLimitCard
          safeLimit={card.safe_limit}
          memberCount={card.member_count}
          submitted={card.submitted}
        />
      );
    case 'ledger':
      return (
        <LedgerCard
          ledger={card.ledger}
          memberCount={card.member_count}
          safeLimit={card.safe_limit}
          lastProposal={card.last_proposal}
          rogueOwner={card.rogue_owner}
        />
      );
    case 'eject':
      return (
        <EjectRouteCard
          member={card.member}
          route={card.route}
          remainingBudget={card.remaining_budget}
          anchorImpact={card.anchor_impact}
        />
      );
    case 'itinerary':
      return <ItineraryCard plan={card.plan} splits={card.splits} />;
    case 'help':
      return <HelpCard examples={card.examples} onPick={onPickExample} />;
  }
}
