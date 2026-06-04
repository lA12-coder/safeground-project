import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type FullPageLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: string;
  children: ReactNode;
};

/**
 * Plain anchor — triggers a full document load instead of Next.js client RSC navigation.
 * Use for /login, /register, and other auth routes that break with soft navigation.
 */
export function FullPageLink({ href, children, className, ...rest }: FullPageLinkProps) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}
