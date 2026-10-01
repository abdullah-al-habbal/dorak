'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/shared/components/buttons/button';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  public static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  public componentDidCatch(): void {}
  public render(): ReactNode { if (this.state.hasError) return <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-2xl font-semibold">Something went wrong</h1><p className="text-sm text-foreground">Please retry. If this persists, contact support.</p><Button onClick={() => this.setState({ hasError: false })} type="button">Try again</Button></main>; return this.props.children; }
}
