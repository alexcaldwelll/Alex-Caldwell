import { ViewTransition, type ReactNode } from 'react';

/** Persistent boundary: lateral pages only fade; GSAP alone owns the story. */
export function RouteTransition({ children }: { children: ReactNode }) {
  return <ViewTransition default="none" update="page-fade">{children}</ViewTransition>;
}

export function PostContinuity({ slug, part, children }: { slug: string; part: 'title' | 'cover'; children: ReactNode }) {
  return <ViewTransition name={`post-${slug}-${part}`} default="none" share="post-continuity">{children}</ViewTransition>;
}
