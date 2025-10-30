import { ActionLine, BlueprintDefinition } from "@/lib/types";

export type ActionSphereStatus = "strength" | "opportunity" | "neutral";

export interface ActionSphere {
  id: string;
  title: string;
  status: ActionSphereStatus;
  detail?: string;
}

export interface PillarModule {
  id: string;
  title: string;
  color?: string;
  actions: ActionSphere[];
}

export interface ThreeData {
  modules: PillarModule[];
}

function mapStatusFromStyle(style: ActionLine["style"]): ActionSphereStatus {
  if (style === "urgent") return "opportunity";
  return "neutral";
}

export function mapTo3DData(
  blueprint: BlueprintDefinition | null,
  actionLines: ActionLine[]
): ThreeData {
  // Group action lines by style to form basic modules
  const groups: Record<string, PillarModule> = {};
  const byStyleTitle: Record<ActionLine["style"], string> = {
    suggestion: "Suggestions",
    urgent: "Urgent Priorities",
    experimental: "Experiments",
  };

  for (const line of actionLines) {
    const key = line.style;
    if (!groups[key]) {
      groups[key] = {
        id: key,
        title: byStyleTitle[key],
        color:
          key === "urgent"
            ? "#f97316" // orange
            : key === "experimental"
            ? "#eab308" // amber
            : "#60a5fa", // blue
        actions: [],
      };
    }
    groups[key].actions.push({
      id: line.line_id,
      title: line.label,
      status: mapStatusFromStyle(line.style),
      detail: line.content,
    });
  }

  // If no action lines, fall back to milestone nodes (if any)
  if (actionLines.length === 0 && blueprint?.milestone_nodes?.length) {
    const module: PillarModule = {
      id: "milestones",
      title: "Milestones",
      color: "#10b981",
      actions: blueprint.milestone_nodes.map((m, idx) => ({
        id: `m-${idx}`,
        title: m.label,
        status: "neutral",
        detail: m.content.core_objective,
      })),
    };
    return { modules: [module] };
  }

  return { modules: Object.values(groups) };
}

