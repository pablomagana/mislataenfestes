import React from 'react';
import { trackOutboundClick } from '@/lib/analytics';

interface OutboundLinkProps {
  /** URL externa a la que apunta el enlace */
  href: string;
  /** ID opcional del enlace para identificarlo en analytics */
  linkId?: string;
  /** Contenido del enlace */
  children: React.ReactNode;
  /** Si abrir en nueva pestaña (default: true) */
  openInNewTab?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Props adicionales del elemento anchor */
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}

/**
 * Componente para enlaces externos que automáticamente trackea clicks salientes.
 * Dispara el evento 'click' con metadata del dominio en GA4.
 * 
 * @example
 * ```tsx
 * <OutboundLink 
 *   href="https://twitter.com/mislataenfestes" 
 *   linkId="header_twitter"
 *   className="text-blue-500 hover:underline"
 * >
 *   Síguenos en Twitter
 * </OutboundLink>
 * ```
 */
export const OutboundLink: React.FC<OutboundLinkProps> = ({
  href,
  linkId,
  children,
  openInNewTab = true,
  className = '',
  anchorProps = {},
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Trackea el click en GA4
    trackOutboundClick(href, linkId);
    
    // Ejecuta el onClick original si existe
    anchorProps.onClick?.(event);
  };

  // Determina las props del target y rel
  const targetProps = openInNewTab 
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...targetProps}
      {...anchorProps}
    >
      {children}
    </a>
  );
};

export default OutboundLink;
