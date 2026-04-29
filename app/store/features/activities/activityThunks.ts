import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { ActivitiesState } from "./types";
import { MasterActivity } from "@/app/components/AdminCore";

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async () => {
    return apiFetch<MasterActivity[]>("/api/activities");
  },
  {
    condition: (_, { getState }) => {
      const { activities } = getState() as { activities: ActivitiesState };
      if (activities.loading || activities.masterActivities.length > 0) {
        return false;
      }
    },
  }
);

export const createActivity = createAsyncThunk("activities/createActivity", async (activity: Partial<MasterActivity>) => {
  return apiFetch<MasterActivity>("/api/activities", {
    method: "POST",
    body: JSON.stringify(activity),
  });
});

export const updateActivity = createAsyncThunk("activities/updateActivity", async (activity: MasterActivity) => {
  return apiFetch<MasterActivity>(`/api/activities`, {
    method: "PUT",
    body: JSON.stringify(activity),
  });
});

export const deleteActivity = createAsyncThunk("activities/deleteActivity", async (id: string) => {
  await apiFetch(`/api/activities?id=${id}`, {
    method: "DELETE",
  });
  return id;
});
