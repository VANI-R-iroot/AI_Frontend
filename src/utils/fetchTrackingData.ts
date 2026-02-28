import axiosInstance from "./baseUrl";
import useTrackingStore from "../zustand/useTrackingStore";
export const fetchTrackingData = async (): Promise<void> => {
const setTrackingData = useTrackingStore.getState().setTrackingData;
  try {
    const res = await axiosInstance.get("/get-main-side-visitor-analytics");
    const tracking = res.data.data.users;
    setTrackingData(tracking);
    sessionStorage.setItem("UserTrackingData", JSON.stringify(tracking));
  } catch (error) {
    console.error("❌ Fetch failed", error);
  }
};


