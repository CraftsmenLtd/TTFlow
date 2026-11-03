import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import { Construct } from 'constructs';

interface BudgetAlertProps {
  alertEmail: string;
}

// COST_ESTIMATE.md expects about $0.50-1.50 for the whole run, so $5 already means
// something is wrong. Alerts are emailed at $2 (40%) and $5 (100%).
const MONTHLY_BUDGET_USD = 5;
const ALERT_PERCENTAGES = [40, 100];

/** Account cost alerts (cost guardrail in COST_ESTIMATE.md). */
export class BudgetAlert extends Construct {
  constructor(scope: Construct, id: string, props: BudgetAlertProps) {
    super(scope, id);

    new CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: 'spindesk-monthly',
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: MONTHLY_BUDGET_USD, unit: 'USD' },
      },
      notificationsWithSubscribers: ALERT_PERCENTAGES.map((threshold) => ({
        notification: {
          notificationType: 'ACTUAL',
          comparisonOperator: 'GREATER_THAN',
          threshold,
          thresholdType: 'PERCENTAGE',
        },
        subscribers: [{ subscriptionType: 'EMAIL', address: props.alertEmail }],
      })),
    });
  }
}
