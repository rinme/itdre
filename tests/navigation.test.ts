import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { mainNav, quickLinks, footerNav } from "$lib/data/navigation";
import { isItemActive } from "$lib/components/layout/MainNavbar.svelte";
import MainNavbar from "$lib/components/layout/MainNavbar.svelte";
import TopHeader from "$lib/components/layout/TopHeader.svelte";
import Footer from "$lib/components/layout/Footer.svelte";
import DemoBanner from "$lib/components/demo/DemoBanner.svelte";
import DemoFeedbackModal from "$lib/components/demo/DemoFeedbackModal.svelte";
import { languageState } from "$lib/state/language.svelte";
import { demoFeedbackState } from "$lib/state/feedback.svelte";

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

  describe("Active Path Evaluation Logic (isItemActive)", () => {
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

    it("activates home item only on exact / path", () => {
      const homeItem = mainNav.find((item) => item.href === "/")!;
      expect(isItemActive(homeItem, "/")).toBe(true);
      expect(isItemActive(homeItem, "/news")).toBe(false);
    });
  });

  describe("Demo Feedback State Integration", () => {
    beforeEach(() => {
      demoFeedbackState.close();
    });

    it("initializes with feedback modal closed", () => {
      expect(demoFeedbackState.isOpen).toBe(false);
    });

    it("opens and closes feedback modal reactively", () => {
      demoFeedbackState.open();
      expect(demoFeedbackState.isOpen).toBe(true);
      demoFeedbackState.close();
      expect(demoFeedbackState.isOpen).toBe(false);
    });
  });

  describe("Component Rendering & Interactions", () => {
    beforeEach(() => {
      languageState.setLanguage("th");
      demoFeedbackState.close();
    });

    it("renders TopHeader with brand and language toggle buttons", () => {
      const { container } = render(TopHeader);
      expect(container.querySelector("header")).not.toBeNull();
      expect(screen.getByAltText("Faculty of Information Technology and Digital Innovation, KMUTNB")).toBeDefined();
      expect(screen.getAllByLabelText("ภาษาไทย").length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText("English").length).toBeGreaterThan(0);
    });

    it("switches language from TopHeader", async () => {
      render(TopHeader);
      const [enBtn] = screen.getAllByLabelText("English");
      await fireEvent.click(enBtn);
      expect(languageState.language).toBe("en");
    });

    it("renders MainNavbar and navigation elements", () => {
      const { container } = render(MainNavbar);
      expect(container.querySelector("nav")).not.toBeNull();
      expect(screen.getByLabelText("Main Navigation")).toBeDefined();
      expect(screen.getByLabelText("Search")).toBeDefined();
    });

    it("renders Footer with contact info and back-to-top button", () => {
      const { container } = render(Footer);
      expect(container.querySelector("footer")).not.toBeNull();
      expect(screen.getByLabelText("Scroll back to top")).toBeDefined();
    });

    it("renders DemoBanner and opens feedback modal", async () => {
      render(DemoBanner);
      const feedbackBtn = screen.getByRole("button", { name: /ให้ข้อเสนอแนะ|Feedback/i });
      expect(feedbackBtn).toBeDefined();

      await fireEvent.click(feedbackBtn);
      expect(demoFeedbackState.isOpen).toBe(true);
    });

    it("renders DemoFeedbackModal when isOpen is true", async () => {
      demoFeedbackState.open();
      const { container } = render(DemoFeedbackModal, { props: { isOpen: true } });
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(screen.getByText(/ข้อเสนอแนะเว็บไซต์ต้นแบบ|Renovation Demo Feedback/i)).toBeDefined();
    });
  });
});
