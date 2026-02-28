
export const getSessionUser = () => {
  const userData = sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

export const updateSessionUser = (newData: any) => {
  const existingData = getSessionUser() || {};
  const mergedData = { ...existingData, ...newData };
  sessionStorage.setItem("user", JSON.stringify(mergedData));
};
