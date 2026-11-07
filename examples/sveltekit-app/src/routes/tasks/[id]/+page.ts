// SvelteKit client load function: runs on client navigation to supply page data
export async function load({ params }: { params: Record<string, string> }) {
  return {
    taskId: params.id || "1",
    title: `Task #${params.id}`,
    summary: `Detailed task item dynamically loaded for ID: ${params.id}`,
    status: Number(params.id) % 2 === 0 ? "Completed" : "In Progress",
    assignedTo: "NativeSvelte Core Team",
  };
}
