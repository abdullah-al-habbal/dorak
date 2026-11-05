import {
  Briefcase4,
  Buildings11,
  Calendar,
  CreditCard,
  FileText,
  Gear1,
  Globe2,
  Layers2,
  Layout14,
  MapMarker5,
  Message1,
  PieChart1,
  Shop,
  SlidersDoubleHorizontal,
  StarFat,
  UserMultiple1,
  Wallet2,
} from "@tailgrids/icons";

export function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
    >
      <g clipPath="url(#clip0_23287_19132)">
        <path
          d="M1.5 9.15294C1.5 7.43662 1.5 6.57846 1.8894 5.86706C2.2788 5.15566 2.99021 4.71414 4.41303 3.83109L5.91302 2.90015C7.41704 1.96672 8.16905 1.5 9 1.5C9.83095 1.5 10.583 1.96672 12.087 2.90015L13.587 3.83109C15.0098 4.71413 15.7212 5.15566 16.1106 5.86706C16.5 6.57846 16.5 7.43662 16.5 9.15294V10.2937C16.5 13.2194 16.5 14.6822 15.6213 15.5911C14.7426 16.5 13.3284 16.5 10.5 16.5H7.5C4.67157 16.5 3.25736 16.5 2.37868 15.5911C1.5 14.6822 1.5 13.2194 1.5 10.2937V9.15294Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M11.25 13.5H6.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_23287_19132">
          <rect width={18} height={18} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
    >
      <circle
        cx={9}
        cy="6.75"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx={9} cy={9} r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13.4769 15C13.3575 12.8314 12.6935 11.25 8.99999 11.25C5.30644 11.25 4.64246 12.8314 4.5231 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV_ICON_SIZE = 18;

export function ChartIcon() {
  return <PieChart1 size={NAV_ICON_SIZE} />;
}

export function BuildingIcon() {
  return <Buildings11 size={NAV_ICON_SIZE} />;
}

export function MapIcon() {
  return <MapMarker5 size={NAV_ICON_SIZE} />;
}

export function StarNavIcon() {
  return <StarFat size={NAV_ICON_SIZE} />;
}

export function TeamIcon() {
  return <UserMultiple1 size={NAV_ICON_SIZE} />;
}

export function BriefcaseIcon() {
  return <Briefcase4 size={NAV_ICON_SIZE} />;
}

export function CalendarNavIcon() {
  return <Calendar size={NAV_ICON_SIZE} />;
}

export function LayersIcon() {
  return <Layers2 size={NAV_ICON_SIZE} />;
}

export function LayoutIcon() {
  return <Layout14 size={NAV_ICON_SIZE} />;
}

export function ShopIcon() {
  return <Shop size={NAV_ICON_SIZE} />;
}

export function WalletIcon() {
  return <Wallet2 size={NAV_ICON_SIZE} />;
}

export function CardIcon() {
  return <CreditCard size={NAV_ICON_SIZE} />;
}

export function FileIcon() {
  return <FileText size={NAV_ICON_SIZE} />;
}

export function MessageIcon() {
  return <Message1 size={NAV_ICON_SIZE} />;
}

export function GlobeIcon() {
  return <Globe2 size={NAV_ICON_SIZE} />;
}

export function SlidersIcon() {
  return <SlidersDoubleHorizontal size={NAV_ICON_SIZE} />;
}

export function GearIcon() {
  return <Gear1 size={NAV_ICON_SIZE} />;
}
