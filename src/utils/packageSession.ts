export const getSessionUser = () => {
    const userData = sessionStorage.getItem("package");
    return userData ? JSON.parse(userData) : null;
  };
  
  export const packageValue = (newData: any) => {
    const existingData = getSessionUser() || {};
    const mergedData = { ...existingData, ...newData };
    sessionStorage.setItem("package", JSON.stringify(mergedData));
  };
  