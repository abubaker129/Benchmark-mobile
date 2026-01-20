import { apiRequest } from "./client";

/* SEARCH ORDERS */
export const searchOrders = (query) => {
  return apiRequest(
    `/in-process-orders?search=${encodeURIComponent(query)}`,
    { method: "GET" }
  );
};

/* SUBMIT ORDER */
export const submitOrder = (formData) => {
  return apiRequest("/submitorder", {
    method: "POST",
    body: formData,
  });
};

export const searchInProcessOrders = (search) => {
  return apiRequest(
    `/in-process-orders?search=${encodeURIComponent(search)}`,
    { method: "GET" }
  );
};
