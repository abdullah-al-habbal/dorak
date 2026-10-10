import { cn } from "@/utils/cn.util";

type LogoProps = React.SVGProps<SVGSVGElement>;

export const Logo = (props: LogoProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <rect width="32" height="32" rx="8" fill="currentColor" opacity={0.12} />
    <path
      d="M9 22V10h3.4l7.2 8.1V10H23v12h-3.4l-7.2-8.1V22H9Z"
      fill="currentColor"
    />
  </svg>
);

interface LogoWithTextProps {
  className?: string;
  name: string;
}

export const LogoWithText = ({ className, name }: LogoWithTextProps) => (
  <span className={cn("inline-flex items-center gap-2 text-text-primary", className)}>
    <Logo />
    <span className="text-lg leading-none font-semibold tracking-tight">
      {name}
    </span>
  </span>
);
