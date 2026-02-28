class SessionFunction {
  setAffiliate(ref: string) {
    localStorage.setItem("ref", ref);
  }
  getAffiliate() {
    return localStorage.getItem("ref");
  }
  


  removeSessions() {
    localStorage.clear();
    window.location.href = "/";
  }
}

export const {
  setAffiliate,
  getAffiliate,
  removeSessions,
} = new SessionFunction();
