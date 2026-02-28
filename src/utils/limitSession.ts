export const updateSessionLimit = (newData: any) => {
  const existingData = getSessionLimit() || {};
  const mergedData = { ...existingData, ...newData };
  sessionStorage.setItem("limit", JSON.stringify(mergedData));
};

export const getSessionLimit = () => {
  const userData = sessionStorage.getItem("limit");
  return userData ? JSON.parse(userData) : null;
};
