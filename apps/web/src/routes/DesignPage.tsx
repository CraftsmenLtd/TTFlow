import { MATCH_STATUSES, type MatchStatus } from '@spindesk/shared';
import { useState } from 'react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { SelectField, TextField } from '../components/ui/Field';
import { ResponsiveTable } from '../components/ui/ResponsiveTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs } from '../components/ui/Tabs';

// Development-only gallery for checking the UI kit at 360/768/1280px. Sample data is fictional.
interface SampleMatch {
  id: string;
  players: string;
  time: string;
  status: MatchStatus;
}

const SAMPLE_MATCHES: SampleMatch[] = [
  { id: 'M1', players: 'Player A vs Player B', time: '13:00', status: 'LIVE' },
  { id: 'M2', players: 'Player C vs Player D', time: '13:30', status: 'SCHEDULED' },
  { id: 'M3', players: 'Player E vs Player F', time: '12:30', status: 'COMPLETED' },
  { id: 'M4', players: 'Player G vs Player H', time: '14:00', status: 'RESCHEDULE_PENDING' },
];

export function DesignPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">UI kit</h1>

      <Card title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Start match</Button>
          <Button variant="destructive" onClick={() => setDialogOpen(true)}>
            Delete match
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card title="Status badges">
        <div className="flex flex-wrap gap-2">
          {MATCH_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </Card>

      <Card title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar name="Sample Player" size="sm" />
          <Avatar name="Another Person" />
          <Avatar name="Third" size="lg" />
        </div>
      </Card>

      <Card title="Tabs">
        <Tabs
          label="Events"
          tabs={[
            { id: 'ms', label: "Men's Singles", content: <p>Men's Singles panel</p> },
            { id: 'md', label: "Men's Doubles", content: <p>Men's Doubles panel</p> },
            { id: 'ws', label: "Women's Singles", content: <p>Women's Singles panel</p> },
          ]}
        />
      </Card>

      <Card title="Responsive table">
        <ResponsiveTable
          caption="Sample matches"
          rows={SAMPLE_MATCHES}
          getRowKey={(m) => m.id}
          columns={[
            { key: 'players', header: 'Match', cell: (m) => m.players, primary: true },
            { key: 'time', header: 'Time', cell: (m) => m.time },
            {
              key: 'status',
              header: 'Status',
              cell: (m) => <StatusBadge status={m.status} />,
              align: 'right',
            },
          ]}
        />
      </Card>

      <Card title="Form fields">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <TextField label="Full name" required autoComplete="name" />
          <TextField label="Mobile" hint="Optional. Only admins can see it." type="tel" />
          <TextField
            label="Company email"
            type="email"
            error="Use your @craftsmensoftware.com address."
          />
          <SelectField
            label="Playing category"
            required
            placeholder="Select…"
            options={[
              { value: 'MEN', label: "Men's" },
              { value: 'WOMEN', label: "Women's" },
            ]}
          />
        </form>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Delete this match?"
        description="This cannot be undone. The change is recorded in the audit log."
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setDialogOpen(false)}>
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
