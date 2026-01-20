export function mapOrderFromApi(raw) {
  return {
    id: raw?.id ?? null,

    // Common
    addressOrderId: raw?.address_order ?? "N/A",
    orderType: raw?.type ?? "N/A",
    code: raw?.client_code ?? "N/A",
    status: raw?.status ?? "N/A",

    // Optional / screen-based
    preference: raw?.preference ?? "N/A",
    orderTime: raw?.created_at ?? "N/A",
    doneTime: raw?.completed_at ?? "N/A",
    pendingTime: raw?.pending_time ?? "N/A",
    pendingReason: raw?.pending_reason ?? "N/A",
    notes: raw?.notes ?? "N/A",

    // Links
    originalLink: raw?.files_link ?? "N/A",
    finalFilesLink: raw?.final_files_link ?? "N/A",

    // File availability
    originalFilesAvailable:
      Array.isArray(raw?.folder_path) && raw.folder_path.length > 0,

    finalFilesAvailable:
      Array.isArray(raw?.final_upload_file_path) &&
      raw.final_upload_file_path.length > 0,

    // Used by UI logic
    isPending: raw?.status === "Pending",
    isCompleted: raw?.status === "Completed",
    isInProcess: raw?.status === "In Process",
  };
}
