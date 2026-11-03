import type { RouteObject } from 'react-router';
import { DesignPage } from '../routes/DesignPage';
import { ErrorPage, NotFoundPage } from '../routes/ErrorPages';
import { HomePage } from '../routes/HomePage';
import { PlaceholderPage } from '../routes/PlaceholderPage';
import { AppShell } from './AppShell';

// Phase 0 skeleton: each placeholder is replaced by its feature in the roadmap phase it names.
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'rules',
        element: (
          <PlaceholderPage
            title="Rules"
            description="Tournament rules and policy, versioned."
            phase="Phase 1.4"
          />
        ),
      },
      {
        path: 'privacy',
        element: (
          <PlaceholderPage
            title="Privacy"
            description="What personal data we collect, who can see it, and when it is deleted."
            phase="Phase 1.4"
          />
        ),
      },
      {
        path: 'login',
        element: (
          <PlaceholderPage
            title="Log in"
            description="Sign in with your company email."
            phase="Phase 1.1"
          />
        ),
      },
      {
        path: 'register',
        element: (
          <PlaceholderPage
            title="Register"
            description="Create an account with your @craftsmensoftware.com email."
            phase="Phase 1.1"
          />
        ),
      },
      {
        path: 'today',
        element: (
          <PlaceholderPage
            title="Today's matches"
            description="Today's fixtures, live scores and your own matches."
            phase="Phase 3.2"
            membersOnly
          />
        ),
      },
      {
        path: 'fixtures',
        element: (
          <PlaceholderPage
            title="Fixtures"
            description="Groups, doubles teams, schedule and knockout brackets."
            phase="Phase 3.2"
            membersOnly
          />
        ),
      },
      {
        path: 'standings',
        element: (
          <PlaceholderPage
            title="Standings"
            description="Group tables with tiebreaks."
            phase="Phase 3.4"
            membersOnly
          />
        ),
      },
      {
        path: 'feedback',
        element: (
          <PlaceholderPage
            title="Feedback"
            description="Send feedback to the organisers, with an anonymous option."
            phase="Phase 1.5"
            membersOnly
          />
        ),
      },
      {
        path: 'me',
        element: (
          <PlaceholderPage
            title="My profile"
            description="Your details and registration."
            phase="Phase 1.3"
            membersOnly
          />
        ),
      },
      {
        path: 'admin',
        element: (
          <PlaceholderPage
            title="Admin"
            description="Tournament administration."
            phase="Phase 1.2"
            membersOnly
          />
        ),
      },
      ...(import.meta.env.DEV ? [{ path: 'design', element: <DesignPage /> }] : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
