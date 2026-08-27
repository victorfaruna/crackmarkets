import * as React from "react";

/**
 * Allows TypeScript to understand SVG files imported as React components via SVGR.
 *
 * Usage:
 *   import Logo from "@/src/assets/icons/logo.svg";
 *   <Logo width={24} height={24} className="text-primary" />
 *
 * For a raw URL import, append ?url:
 *   import logoUrl from "@/src/assets/icons/logo.svg?url";
 *   <img src={logoUrl} />
 */
declare module "*.svg" {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "*.svg?url" {
  const src: string;
  export default src;
}
