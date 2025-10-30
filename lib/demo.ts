import { useBlueprintStore } from "@/lib/store/blueprintStore";
import { ActionLine, BlueprintDefinition, SessionState } from "@/lib/types";

export function isDemo(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO === "1") return true;
  if (typeof window === "undefined") return false;
  const sp = new URLSearchParams(window.location.search);
  return sp.get("demo") === "1";
}

export const demoBlueprint: BlueprintDefinition = {
  main_path: [
    { segment_id: "seed", stage_name: "Seedling" },
    { segment_id: "sprout", stage_name: "Sprout" },
    { segment_id: "grow", stage_name: "Growth" },
    { segment_id: "scale", stage_name: "Scale" },
  ],
  milestone_nodes: [
    {
      label: "Must-have Validation",
      position_on_path: 0.15,
      content: {
        core_objective: "5-10 in-depth interviews verify must-have need",
        key_signals: ["users say they'd be very disappointed without it"],
      },
    },
    {
      label: "Cohort Tracking Setup",
      position_on_path: 0.28,
      content: {
        core_objective: "Instrumentation to validate engagement",
        key_signals: ["retention curve shape known", "north-star defined"],
      },
    },
  ],
};

export const demoSession: SessionState = {
  session_id: "demo-session",
  blueprint_definition: demoBlueprint,
  current_position: 0.18,
  active_cycle_index: 1,
  last_assessment_narrative: "We are still early; focus on must-have validation and first cohort tracking.",
};

export const demoActionLines: ActionLine[] = [
  {
    line_id: "a-1",
    label: "Deep-dive must-have interviews",
    style: "urgent",
    content: "Interview 5-10 users to confirm must-have signals.",
  },
  {
    line_id: "a-2",
    label: "Set up first cohort analytics",
    style: "suggestion",
    content: "Instrument product events and define retention cohort dashboard.",
  },
  {
    line_id: "a-3",
    label: "CAC baseline experiment",
    style: "experimental",
    content: "Run a tiny paid test to estimate acquisition cost.",
  },
];

export function applyDemoSeed() {
  const s = useBlueprintStore.getState();
  s.setSessionId(demoSession.session_id);
  s.setSessionState(demoSession);
  s.setActionLines(demoActionLines);
  s.setNarrative(demoSession.last_assessment_narrative || "");
}

export async function simulateCalibration(feedback: string, onStream?: (chunk: string, done?: boolean) => void) {
  const s = useBlueprintStore.getState();
  const chunks = [
    "Analyzing your feedback... ",
    "Adjusting position slightly to reflect early traction... ",
    "Focusing next cycle on must-have validation."
  ];
  for (let i = 0; i < chunks.length; i++) {
    await new Promise((r) => setTimeout(r, 400));
    onStream?.(chunks[i], i === chunks.length - 1);
  }
  const newPos = Math.min(1, (s.currentPosition || 0.18) + 0.07);
  s.updatePosition(newPos);
  s.setActionLines([
    ...s.actionLines,
    {
      line_id: `a-${Date.now()}`,
      label: "Refine interview script",
      style: "suggestion",
      content: "Add 'very disappointed' probe and switching-cost questions.",
    },
  ]);
  s.setNarrative((s.narrative || "") + "\n" + chunks.join(""));
}

export async function simulateCycle(observations: string, onStream?: (chunk: string, done?: boolean) => void) {
  const s = useBlueprintStore.getState();
  const chunks = [
    "Processing observations... ",
    "Integrating signals into blueprint... ",
    "Next: run 2 more interviews and set cohort dashboard."
  ];
  for (let i = 0; i < chunks.length; i++) {
    await new Promise((r) => setTimeout(r, 400));
    onStream?.(chunks[i], i === chunks.length - 1);
  }
  const newPos = Math.min(1, (s.currentPosition || 0.18) + 0.05);
  s.updatePosition(newPos);
  s.setActionLines([
    ...s.actionLines,
    {
      line_id: `c-${Date.now()}`,
      label: "Build cohort dashboard",
      style: "urgent",
      content: "Implement retention by signup week and track activation steps.",
    },
  ]);
  s.setNarrative((s.narrative || "") + "\n" + chunks.join(""));
}

