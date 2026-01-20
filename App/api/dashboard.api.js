import { apiRequest } from "./client";

export const getOrderStats = ({ fromDate, toDate } = {}) => {
  let query = "";

  if (fromDate && toDate) {
    query = `?from_date=${fromDate}&to_date=${toDate}`;
  }

  return apiRequest(`/orderstats${query}`, {
    method: "GET",
  });
};
