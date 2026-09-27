import { describe, it, expect } from "bun:test";
import { mainNav, quickLinks, footerNav } from "@/data/navigation";
import type { NavItem } from "@/types";

describe("Site Navigation & Schedule Integration", () => {
  it("includes Class Schedules as a top-level item in mainNav", () => {
    const schedulesItem = mainNav.find((item) => item.href === "/schedules");
    expect(schedulesItem).toBeDefined();
    expect(schedulesItem?.titleTh).toBe("ตารางเรียน");
    expect(schedulesItem?.titleEn).toBe("Class Schedules");
  });

  it("includes Class Schedules under Services dropdown in mainNav", () => {
    const servicesItem = mainNav.find((item) => item.href === "/services");
    expect(servicesItem).toBeDefined();
    const schedulesChild = servicesItem?.children?.find((c) => c.href === "/schedules");
    expect(schedulesChild).toBeDefined();
    expect(schedulesChild?.titleTh).toBe("ตารางเรียน");
    expect(schedulesChild?.titleEn).toBe("Class Schedules");
  });

  it("includes Class Schedules in quickLinks", () => {
    const quickSchedules = quickLinks.find((item) => item.href === "/schedules");
    expect(quickSchedules).toBeDefined();
    expect(quickSchedules?.titleTh).toBe("ตารางเรียน");
    expect(quickSchedules?.titleEn).toBe("Class Schedules");
  });

  it("includes Class Schedules in footerNav under E-Services", () => {
    const servicesCategory = footerNav.find(
      (cat) => cat.titleEn === "E-Services & Systems" || cat.titleTh === "บริการและระบบสารสนเทศ"
    );
    expect(servicesCategory).toBeDefined();
    const footerSchedule = servicesCategory?.items.find((item) => item.href === "/schedules");
    expect(footerSchedule).toBeDefined();
    expect(footerSchedule?.titleTh).toBe("ตารางเรียน");
    expect(footerSchedule?.titleEn).toBe("Class Schedules");
  });

  describe("Active Path Evaluation Logic", () => {
    // Mirror the isItemActive function in MainNavbar.tsx
    const isItemActive = (item: NavItem, pathname: string) => {
      if (item.href === "/" && pathname === "/") return true;
      if (item.href === "/schedules") {
        return pathname === "/schedules" || pathname.startsWith("/schedules/");
      }
      if (item.href !== "/" && pathname.startsWith(item.href.split("?")[0].split("#")[0])) {
        return true;
      }
      if (item.children) {
        return item.children.some((child) => {
          if (child.href === "/schedules") return false;
          return (
            child.href.startsWith("/") &&
            pathname.startsWith(child.href.split("?")[0].split("#")[0])
          );
        });
      }
      return false;
    };

    it("activates top-level schedules item on exact /schedules path", () => {
      const schedulesItem = mainNav.find((item) => item.href === "/schedules")!;
      expect(isItemActive(schedulesItem, "/schedules")).toBe(true);
    });

    it("activates top-level schedules item on nested /schedules paths", () => {
      const schedulesItem = mainNav.find((item) => item.href === "/schedules")!;
      expect(isItemActive(schedulesItem, "/schedules/preview")).toBe(true);
      expect(isItemActive(schedulesItem, "/schedules/cls123")).toBe(true);
    });

    it("does not falsely activate Services as parent when visiting /schedules", () => {
      const servicesItem = mainNav.find((item) => item.href === "/services")!;
      expect(isItemActive(servicesItem, "/schedules")).toBe(false);
    });

    it("activates Services item when visiting /services", () => {
      const servicesItem = mainNav.find((item) => item.href === "/services")!;
      expect(isItemActive(servicesItem, "/services")).toBe(true);
      expect(isItemActive(servicesItem, "/services#downloads")).toBe(true);
    });

    it("does not activate schedules item on home or news paths", () => {
      const schedulesItem = mainNav.find((item) => item.href === "/schedules")!;
      expect(isItemActive(schedulesItem, "/")).toBe(false);
      expect(isItemActive(schedulesItem, "/news")).toBe(false);
      expect(isItemActive(schedulesItem, "/about")).toBe(false);
    });
  });
});
