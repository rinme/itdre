import { AdminPresetsProvider } from "@/context/AdminPresetsContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPresetsProvider>{children}</AdminPresetsProvider>;
}
