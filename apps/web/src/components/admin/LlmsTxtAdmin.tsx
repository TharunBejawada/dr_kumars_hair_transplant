"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type LlmsTxtConfig,
  type LlmsTxtSection,
  type LlmsTxtLink,
} from "@drkumar/shared";
import {
  getDefaultLlmsConfig,
  resolveLinkUrl,
} from "@/lib/llms-txt/generator";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";
import {
  FaArrowDown,
  FaArrowUp,
  FaArrowUpRightFromSquare,
  FaBolt,
  FaChevronDown,
  FaChevronUp,
  FaFloppyDisk,
  FaMagnifyingGlass,
  FaPlus,
  FaRotate,
  FaTrash,
} from "react-icons/fa6";

interface LlmsTxtAdminProps {
  initialConfig: LlmsTxtConfig;
}

export default function LlmsTxtAdmin({ initialConfig }: LlmsTxtAdminProps) {
  const toast = useToast();
  const confirm = useConfirm();

  const [config, setConfig] = useState<LlmsTxtConfig>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<LlmsTxtConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Dirty state: checks if current state differs from last saved state
  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(savedConfig);
  }, [config, savedConfig]);

  // Toggle collapse for a section
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Section manipulation
  const addSection = () => {
    const newSection: LlmsTxtSection = {
      id: `sec-${Date.now().toString(36)}`,
      title: "New Section",
      description: "",
      isOptional: false,
      links: [],
    };
    setConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeSection = async (sectionId: string, sectionTitle: string) => {
    const ok = await confirm({
      title: "Delete Section?",
      message: `Are you sure you want to delete "${sectionTitle || "this section"}" and all its links?`,
      confirmLabel: "Delete Section",
      danger: true,
    });
    if (!ok) return;

    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
    toast("Section deleted", "success");
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    setConfig((prev) => {
      const next = [...prev.sections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return { ...prev, sections: next };
    });
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<LlmsTxtSection>
  ) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    }));
  };

  // Link manipulation
  const addLink = (sectionId: string) => {
    const newLink: LlmsTxtLink = {
      id: `lnk-${Date.now().toString(36)}`,
      title: "New Resource Link",
      url: "/",
      description: "Short 1-sentence description of this page.",
      inLlmsTxt: true,
      inLlmsFullTxt: true,
      entityType: "custom",
    };
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, links: [...s.links, newLink] } : s
      ),
    }));
  };

  const removeLink = (sectionId: string, linkId: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, links: s.links.filter((l) => l.id !== linkId) }
          : s
      ),
    }));
  };

  const updateLink = (
    sectionId: string,
    linkId: string,
    updates: Partial<LlmsTxtLink>
  ) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: s.links.map((l) =>
                l.id === linkId ? { ...l, ...updates } : l
              ),
            }
          : s
      ),
    }));
  };

  const moveLink = (
    sectionId: string,
    index: number,
    direction: "up" | "down"
  ) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= s.links.length) return s;
        const nextLinks = [...s.links];
        const temp = nextLinks[index];
        nextLinks[index] = nextLinks[targetIndex];
        nextLinks[targetIndex] = temp;
        return { ...s, links: nextLinks };
      }),
    }));
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/llms-txt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save configuration");
      }

      setSavedConfig(data.config);
      setConfig(data.config);
      toast("LLMs.txt configuration saved successfully!", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Auto-sync with DynamoDB treatments, services, blogs
  const handleAutoSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/llms-txt/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Auto-sync failed");
      }

      setConfig(data.config);
      toast(data.message || "Database entities synced successfully!", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSyncing(false);
    }
  };

  // Reset to default configuration
  const handleReset = async () => {
    const ok = await confirm({
      title: "Reset Configuration?",
      message: "This will revert your current configuration back to the clinic's standard default template. Any unsaved edits will be lost.",
      confirmLabel: "Reset to Defaults",
      danger: true,
    });
    if (!ok) return;

    const defaults = getDefaultLlmsConfig(config.baseUrl);
    setConfig(defaults);
    toast("Reverted to clinic default template", "success");
  };

  // Filter sections and links based on search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return config.sections;

    return config.sections
      .map((section) => {
        const matchesSection =
          section.title.toLowerCase().includes(q) ||
          (section.description || "").toLowerCase().includes(q);

        const matchingLinks = section.links.filter(
          (link) =>
            link.title.toLowerCase().includes(q) ||
            link.url.toLowerCase().includes(q) ||
            link.description.toLowerCase().includes(q)
        );

        if (matchesSection || matchingLinks.length > 0) {
          return {
            ...section,
            links: matchesSection ? section.links : matchingLinks,
          };
        }
        return null;
      })
      .filter(Boolean) as LlmsTxtSection[];
  }, [config.sections, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-brand">
            <FaBolt className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-gray-900">
                LLMs.txt System Status
              </h2>
              {isDirty ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  Unsaved Changes
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Published &amp; Synced
                </span>
              )}
            </div>
            <p className="text-[13px] text-gray-500">
              Directly rendered on-demand &bull; Compliant with{" "}
              <a
                href="https://llmstxt.org"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline hover:text-brand-2"
              >
                https://llmstxt.org
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Live Endpoint */}
          <Link
            href="/llms.txt"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <span>View /llms.txt</span>
            <FaArrowUpRightFromSquare className="size-3 text-gray-400" />
          </Link>

          {/* Auto-Sync from Database */}
          <button
            type="button"
            onClick={handleAutoSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3.5 py-2 text-[13px] font-semibold text-brand hover:bg-teal-100 disabled:opacity-50 transition"
            title="Scan database for new treatments, services, and blogs to automatically include"
          >
            <FaRotate className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Auto-Sync with DB"}</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Reset
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-[14px] font-semibold text-white shadow-sm hover:bg-brand-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FaFloppyDisk className="size-3.5" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Single Column Editor (Sidebar preview removed) */}
      <div className="space-y-6">
        {/* Header & Meta Config Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-[16px] font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
            <span>Header &amp; Meta Configuration</span>
            <span className="text-[12px] font-normal text-gray-400">Spec Layer 1</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700">
                  Site / Clinic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Dr. Kumar's Skin & Hair Transplant Center"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700">
                  Base URL (Domain)
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                  }
                  placeholder="https://drkumarshairtransplant.com"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700">
                Tagline
              </label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, tagline: e.target.value }))
                }
                placeholder="e.g. Advanced Hair Restoration, Clinical Dermatology &amp; Aesthetic Skin Care in Kondapur, Hyderabad"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700">
                Blockquote Summary (Mandatory for LLMs){" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-[12px] text-gray-500 mb-1">
                A high-signal 1–3 sentence overview of clinic authority, physician credentials, and scope.
              </p>
              <textarea
                rows={3}
                value={config.summary}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Short, factual summary describing the clinic and specialties for AI crawlers..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-[14px] text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700">
                System Instructions &amp; Clinical Disclaimers (Optional)
              </label>
              <p className="text-[12px] text-gray-500 mb-1">
                Specific behavioral guidance for AI agents (e.g. candidate safety criteria, contact phone, consultation policy).
              </p>
              <textarea
                rows={3}
                value={config.systemInstructions}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    systemInstructions: e.target.value,
                  }))
                }
                placeholder="Instructions for AI models responding to patients..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-[14px] text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        </div>

        {/* Section & Link Builder Header with Live Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900">
              Sections &amp; Curated Links ({config.sections.length})
            </h3>
            <p className="text-[13px] text-gray-500">
              Organize resources into markdown headings and toggle inclusion in /llms.txt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sections &amp; links..."
                className="h-9 w-48 sm:w-60 rounded-lg border border-gray-300 pl-8 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="button"
              onClick={addSection}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-sm hover:bg-brand-2 transition"
            >
              <FaPlus className="size-3" />
              <span>Add Section</span>
            </button>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              <p className="text-[15px] font-medium">No matching sections found.</p>
              <p className="mt-1 text-[13px]">
                Try clearing your search query or add a new section above.
              </p>
            </div>
          ) : (
            filteredSections.map((section, sIndex) => {
              const isCollapsed = Boolean(collapsedSections[section.id]);
              const activeLinkCount = section.links.filter((l) => l.inLlmsTxt).length;

              return (
                <div
                  key={section.id}
                  className={`rounded-xl border transition-all ${
                    section.isOptional
                      ? "border-amber-200 bg-amber-50/20"
                      : "border-gray-200 bg-white"
                  } shadow-sm overflow-hidden`}
                >
                  {/* Section Header Bar */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50/80 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse(section.id)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        {isCollapsed ? (
                          <FaChevronDown className="size-3.5" />
                        ) : (
                          <FaChevronUp className="size-3.5" />
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(section.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Section Title (e.g. Clinical Departments)"
                          className="h-8 rounded border border-transparent bg-transparent px-2 font-bold text-gray-900 text-[15px] hover:border-gray-300 focus:border-brand focus:bg-white focus:outline-none"
                        />

                        {section.isOptional && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Optional Section
                          </span>
                        )}

                        <span className="text-[12px] text-gray-400">
                          ({activeLinkCount} / {section.links.length} active)
                        </span>
                      </div>
                    </div>

                    {/* Section Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveSection(sIndex, "up")}
                        disabled={sIndex === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        title="Move section up"
                      >
                        <FaArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(sIndex, "down")}
                        disabled={sIndex === config.sections.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        title="Move section down"
                      >
                        <FaArrowDown className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          removeSection(section.id, section.title)
                        }
                        className="p-1.5 text-red-400 hover:text-red-600 ml-1"
                        title="Delete section"
                      >
                        <FaTrash className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Section Body */}
                  {!isCollapsed && (
                    <div className="p-4 space-y-4">
                      {/* Section Options */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                        <div className="sm:col-span-8">
                          <label className="block text-[12px] font-semibold text-gray-600">
                            Section Intro / Subtitle (Optional)
                          </label>
                          <input
                            type="text"
                            value={section.description || ""}
                            onChange={(e) =>
                              updateSection(section.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Brief description printed beneath the heading in markdown..."
                            className="mt-0.5 w-full rounded border border-gray-300 px-2.5 py-1.5 text-[13px] text-gray-800 focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-4 flex items-center pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={Boolean(section.isOptional)}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  isOptional: e.target.checked,
                                })
                              }
                              className="size-4 rounded text-brand focus:ring-brand"
                            />
                            <span>Mark as Optional Section (### Optional)</span>
                          </label>
                        </div>
                      </div>

                      {/* Links in this section */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-[13px] font-semibold text-gray-700 border-b border-gray-100 pb-1.5">
                          <span>Links in this section ({section.links.length})</span>
                          <button
                            type="button"
                            onClick={() => addLink(section.id)}
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-brand hover:text-brand-2"
                          >
                            <FaPlus className="size-2.5" />
                            <span>Add Link</span>
                          </button>
                        </div>

                        {section.links.length === 0 ? (
                          <p className="text-[13px] text-gray-400 italic py-2">
                            No links added to this section yet. Click &quot;Add Link&quot; above.
                          </p>
                        ) : (
                          section.links.map((link, lIndex) => {
                            const resolved = resolveLinkUrl(link.url, config.baseUrl);
                            return (
                              <div
                                key={link.id}
                                className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 hover:border-gray-300 transition"
                              >
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                                  {/* Link Title */}
                                  <div className="sm:col-span-5">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                      Link Title
                                    </label>
                                    <input
                                      type="text"
                                      value={link.title}
                                      onChange={(e) =>
                                        updateLink(section.id, link.id, {
                                          title: e.target.value,
                                        })
                                      }
                                      placeholder="e.g. Hair Transplant in Kondapur"
                                      className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-[13px] font-semibold text-gray-900 focus:border-brand focus:outline-none"
                                    />
                                  </div>

                                  {/* URL / Path */}
                                  <div className="sm:col-span-4">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                                      <span>URL or Path</span>
                                      <a
                                        href={resolved}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-brand hover:underline text-[10px] lowercase"
                                      >
                                        test link ↗
                                      </a>
                                    </label>
                                    <input
                                      type="text"
                                      value={link.url}
                                      onChange={(e) =>
                                        updateLink(section.id, link.id, {
                                          url: e.target.value,
                                        })
                                      }
                                      placeholder="/hair/hair-transplant"
                                      className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-[13px] font-mono text-gray-800 focus:border-brand focus:outline-none"
                                    />
                                  </div>

                                  {/* Toggles and controls */}
                                  <div className="sm:col-span-3 flex items-center justify-between pt-3 sm:pt-0 sm:justify-end gap-3">
                                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-gray-700 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={link.inLlmsTxt}
                                        onChange={(e) =>
                                          updateLink(section.id, link.id, {
                                            inLlmsTxt: e.target.checked,
                                            inLlmsFullTxt: e.target.checked,
                                          })
                                        }
                                        className="size-3.5 rounded text-brand focus:ring-brand"
                                      />
                                      <span>Include in llms.txt</span>
                                    </label>

                                    <div className="flex items-center gap-1 ml-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moveLink(section.id, lIndex, "up")
                                        }
                                        disabled={lIndex === 0}
                                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                                        title="Move link up"
                                      >
                                        <FaArrowUp className="size-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moveLink(section.id, lIndex, "down")
                                        }
                                        disabled={
                                          lIndex === section.links.length - 1
                                        }
                                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                                        title="Move link down"
                                      >
                                        <FaArrowDown className="size-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeLink(section.id, link.id)
                                        }
                                        className="p-1 text-red-400 hover:text-red-600"
                                        title="Remove link"
                                      >
                                        <FaTrash className="size-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Link Description */}
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    value={link.description}
                                    onChange={(e) =>
                                      updateLink(section.id, link.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Clean 1-sentence description explaining what this page covers for AI models..."
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-[12.5px] text-gray-700 focus:border-brand focus:outline-none"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
