import React from 'react';
import { trackOutboundClick } from '@/lib/analytics';

interface OutboundLinkProps {
  href: string;
  linkId?: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export const OutboundLink: React.FC<OutboundLinkProps> = ({
  href,
  linkId,
  children,
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}) => {
  const handleClick = () => {
    trackOutboundClick(href, linkId);
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};