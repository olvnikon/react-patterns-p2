import { ActivityFeedEntry } from '@demo/feature-activity-feed';
import { OrdersEntry } from '@demo/feature-orders';
import { PortfolioSummaryEntry } from '@demo/feature-portfolio-summary';
import { RiskSummaryEntry } from '@demo/feature-risk-summary';
import {
  CenterContent,
  LeftNav,
  RightContent,
  WorkspaceLayout,
} from '@demo/ui-layouts';

import { PatternNote } from './components/PatternNote';

export function OrdersRoute() {
  const selectedDeskId = 'DESK-GLOBAL';
  const selectedPortfolioId = 'PF-001';
  const userId = 'USR-DEMO';

  return (
    <WorkspaceLayout
      leftNav={
        <LeftNav>
          <PortfolioSummaryEntry selectedPortfolioId={selectedPortfolioId} />
        </LeftNav>
      }
      centerContent={
        <CenterContent>
          <PatternNote
            ariaLabel="Orders route pattern"
            tags={['Flat composition', 'Slot layout', 'Public feature entries']}
          >
            This route composes the left, center, and right workspace regions
            directly.
          </PatternNote>
          <OrdersEntry
            selectedDeskId={selectedDeskId}
            selectedPortfolioId={selectedPortfolioId}
          />
        </CenterContent>
      }
      rightContent={
        <RightContent>
          <RiskSummaryEntry selectedPortfolioId={selectedPortfolioId} />
          <ActivityFeedEntry userId={userId} />
        </RightContent>
      }
    />
  );
}
