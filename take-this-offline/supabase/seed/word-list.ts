// 100 business and tech jargon terms to seed.
// Spread across Strategy, Tech, Finance, HR, Operations, Marketing, Legal, Other categories.
// These titles are passed to Claude for full editorial content generation.
export const WORD_LIST: string[] = [
  // Strategy (15)
  'Synergy', 'Pivot', 'Boil the ocean', 'Move the needle', 'Bandwidth',
  'Circle back', 'Deep dive', 'Low-hanging fruit', 'North star', 'Paradigm shift',
  'Run it up the flagpole', 'Skin in the game', 'Think outside the box', 'Wheelhouse', 'Alignment',
  // Tech (20)
  'Technical debt', 'Refactoring', 'Dogfooding', 'Rubber duck debugging', 'Bikeshedding',
  'Yak shaving', 'Greenfield', 'Brownfield', 'Canary deployment', 'Feature flag',
  'Rate limiting', 'Idempotent', 'Event sourcing', 'CQRS', 'Eventually consistent',
  'Sharding', 'Load balancing', 'Infrastructure as code', 'Shift left', 'Zero downtime deployment',
  // Finance (12)
  'Runway', 'Burn rate', 'EBITDA', 'Waterfall', 'Cap table',
  'Term sheet', 'Dilution', 'Valuation', 'Due diligence', 'Bridge financing',
  'Convertible note', 'Liquidity event',
  // HR (10)
  'Culture fit', 'Quiet quitting', 'Boomerang employee', 'High performer', 'Bench strength',
  'Succession planning', 'Span of control', 'Headcount', 'Onboarding', 'Offboarding',
  // Operations (12)
  'Bottleneck', 'Throughput', 'SLA', 'Escalation path', 'Change management',
  'Post-mortem', 'Runbook', 'Single point of failure', 'Bus factor', 'Operational cadence',
  'KPI', 'OKR',
  // Marketing (12)
  'Funnel', 'Top of funnel', 'Attribution', 'CAC', 'LTV',
  'Churn', 'Net Promoter Score', 'A/B testing', 'Growth hacking', 'Product-market fit',
  'Go-to-market', 'Positioning',
  // Legal (8)
  'Force majeure', 'Indemnification', 'IP assignment', 'NDA', 'Non-compete',
  'Liability cap', 'Arbitration clause', 'Governing law',
  // Other (11)
  'Optics', 'Stakeholder', 'Deliverable', 'Action item', 'Leverage',
  'Pushback', 'Sandbox', 'Silo', 'Boilerplate', 'Granular',
  'Baked in',
]
