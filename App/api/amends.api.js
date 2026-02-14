import { supabase } from "../integrations/supabase/client";

export const AMEND_STATUS = {
  pending: "Pending",
  in_progress: "In Progress",
  awaiting_data: "Awaiting Data",
  pending_check: "Pending Review",
  checking: "Checking",
  checker_rejected: "Rejected",
  worker_rejected: "Needs Revision",
  completed: "Completed",
};

function getStorageUrl(bucketName, filePath) {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data?.publicUrl || "";
}

export function getDeliverableDisplayUrl(deliverable, bucketName = "order-files") {
  if (deliverable?.file_path) {
    return getStorageUrl(bucketName, deliverable.file_path);
  }
  if (deliverable?.file_url?.startsWith("http")) {
    return deliverable.file_url;
  }
  if (deliverable?.file_url) {
    return getStorageUrl(bucketName, deliverable.file_url);
  }
  return "";
}

export function formatServiceName(serviceId) {
  if (!serviceId) return "Unknown Service";
  return String(serviceId)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function listAmends() {
  const { data, error } = await supabase
    .from("amends")
    .select(`
      *,
      order:orders(
        id,
        order_number,
        order_type,
        property:properties(id, name, street, city)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function listOrdersForAmend() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      order_type,
      property:properties(id, name, street, city)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function listOrderDeliverables(orderId) {
  if (!orderId) return [];

  const { data, error } = await supabase
    .from("order_deliverables")
    .select("*")
    .eq("order_id", orderId)
    .is("amend_id", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAmend({ orderId, serviceId, notes, userId, portalId }) {
  if (!userId) throw new Error("Not authenticated");
  if (!portalId) throw new Error("No portal assigned");

  const { data, error } = await supabase
    .from("amends")
    .insert({
      order_id: orderId,
      service_id: serviceId,
      notes: notes || null,
      agent_id: userId,
      portal_id: portalId,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createAnnotation({
  amendId,
  imageUrl,
  serviceId,
  annotationData,
  annotatedImageUrl,
}) {
  const { data, error } = await supabase
    .from("amend_annotations")
    .insert({
      amend_id: amendId,
      image_url: imageUrl,
      service_id: serviceId,
      annotation_data: annotationData || {},
      annotated_image_url: annotatedImageUrl || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function submitAmendsForServices({
  orderId,
  selectedServiceIds,
  notes,
  userId,
  portalId,
  selectedImageUrlsByService,
}) {
  const createdAmends = [];
  const failedAnnotations = [];

  for (const serviceId of selectedServiceIds) {
    const amend = await createAmend({
      orderId,
      serviceId,
      notes,
      userId,
      portalId,
    });

    createdAmends.push(amend);

    const imageUrls = selectedImageUrlsByService?.[serviceId] || [];
    for (const imageUrl of imageUrls) {
      try {
        await createAnnotation({
          amendId: amend.id,
          imageUrl,
          serviceId,
          annotationData: {
            source: "mobile_app",
            type: "reference_selection",
            created_at: new Date().toISOString(),
          },
          annotatedImageUrl: null,
        });
      } catch (error) {
        failedAnnotations.push({
          amendId: amend.id,
          serviceId,
          imageUrl,
          error: error?.message || "Failed to create annotation",
        });
      }
    }
  }

  return { createdAmends, failedAnnotations };
}
