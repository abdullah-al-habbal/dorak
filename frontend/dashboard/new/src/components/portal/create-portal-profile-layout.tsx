import { ProfileContent } from "@/components/profile/profile-content";

export function createPortalProfileLayout() {
  return function PortalProfileLayout({ children }: { children: React.ReactNode }) {
    return <ProfileContent>{children}</ProfileContent>;
  };
}
