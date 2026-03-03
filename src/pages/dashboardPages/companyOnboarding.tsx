import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/baseUrl";
import { useUserStore } from "../../zustand/userDetailsStore";
import adminImage from "../../assets/image/admin/allImage";
import { Country, State, City } from "country-state-city";

interface Platform {
  id: number;
  name: string;
}

interface Industry {
  id: number;
  name: string;
}

type CountryOption = { name: string; isoCode: string; phonecode?: string };
type StateOption = { name: string; isoCode: string; countryCode: string };
type CityOption = { name: string; stateCode: string; countryCode: string };

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    city: "",
    country: "",
    state: "",
    contact_number: "",
    platform_type_id: "",
    industry_type_id: "",
    role: "",
    team_size: "",
  });

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedPhoneCode, setSelectedPhoneCode] = useState("+1");
  const [loading, setLoading] = useState(false);
  const isDuplicatePhoneError = (status: number | undefined, message: string) =>
    status === 409 ||
    /contact number|phone number|already in use|duplicate/i.test(
      String(message || "")
    );
  const roleOptions = [
    "Founder/CEO",
    "Product Manager",
    "Marketing",
    "Sales",
    "Developer",
    "Designer",
    "Operations",
    "Customer Support",
    "Other",
  ];
  const teamSizeOptions = [
    "1-5",
    "6-10",
    "11-25",
    "26-50",
    "51-100",
    "101-250",
    "251-500",
    "500+",
  ];

  // Fetch platform and industry types
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [platformRes, industryRes] = await Promise.all([
          axiosInstance.get("/company/platforms"),
          axiosInstance.get("/company/industries"),
        ]);

        setPlatforms(platformRes.data?.data || []);
        setIndustries(industryRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching options:", error);
        toast.error("Failed to load form options");
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const notice = localStorage.getItem("login_welcome_notice");
    if (notice) {
      toast.success(notice);
      localStorage.removeItem("login_welcome_notice");
    }
  }, []);

  useEffect(() => {
    const allCountries = Country.getAllCountries() as CountryOption[];
    setCountries(allCountries);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const selected = countries.find((c) => c.isoCode === countryCode);
    setSelectedCountryCode(countryCode);
    setSelectedStateCode("");
    setStates(countryCode ? (State.getStatesOfCountry(countryCode) as StateOption[]) : []);
    setCities([]);
    setFormData((prev) => ({
      ...prev,
      country: selected?.name || "",
      state: "",
      city: "",
    }));
    if (selected?.phonecode) {
      setSelectedPhoneCode(`+${selected.phonecode}`);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    const selected = states.find((s) => s.isoCode === stateCode);
    setSelectedStateCode(stateCode);
    setCities(
      selectedCountryCode && stateCode
        ? (City.getCitiesOfState(selectedCountryCode, stateCode) as CityOption[])
        : []
    );
    setFormData((prev) => ({
      ...prev,
      state: selected?.name || "",
      city: "",
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.city ||
      !formData.country ||
      !formData.state ||
      !formData.contact_number ||
      !formData.platform_type_id ||
      !formData.industry_type_id
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const fullContactNumber = `${selectedPhoneCode} ${String(
        formData.contact_number || ""
      ).trim()}`.trim();
      const response = await axiosInstance.post("/company", {
        name: formData.name,
        website: formData.website || null,
        city: formData.city,
        country: formData.country,
        state: formData.state,
        contact_number: fullContactNumber,
        platform_type_id: parseInt(formData.platform_type_id),
        industry_type_id: parseInt(formData.industry_type_id),
        role: formData.role || null,
        team_size: formData.team_size || null,
      });

      if (response.data?.success) {
        toast.success("Company created successfully!");
        
        // Mark onboarding as completed
        await axiosInstance.post("/company/onboarding/complete");

        const fullContactNumber = `${selectedPhoneCode} ${String(
          formData.contact_number || ""
        ).trim()}`.trim();
        setUserData({
          company_name: formData.name,
          companyName: formData.name,
          company_website: formData.website || "",
          companyWebsite: formData.website || "",
          city: formData.city,
          country: formData.country,
          state: formData.state,
          phone_number: fullContactNumber,
          phoneNumber: fullContactNumber,
          job_role: formData.role || "",
          jobRole: formData.role || "",
          onboarding_completed: 1,
        });
        
        // Redirect to dashboard after a short delay
        localStorage.setItem(
          "login_welcome_notice",
          `Welcome, ${userData?.name || "User"}!`
        );
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        const msg =
          response.data?.message ||
          response.data?.error ||
          "Failed to create company. Please try again.";
        const duplicatePhone = isDuplicatePhoneError(undefined, msg);
        const duplicateMsg = "Duplicate phone number. Contact number already in use.";
        if (duplicatePhone) {
          toast.error(duplicateMsg);
          window.alert(duplicateMsg);
        } else {
          toast.error(msg);
        }
      }
    } catch (error: any) {
      console.error("Error creating company:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create company. Please try again.";
      const duplicatePhone = isDuplicatePhoneError(error?.response?.status, msg);
      const duplicateMsg = "Duplicate phone number. Contact number already in use.";
      if (duplicatePhone) {
        toast.error(duplicateMsg);
        window.alert(duplicateMsg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    toast.info("Skipped for now. Please complete company onboarding to use Product Analyser uploads.");
    localStorage.setItem(
      "login_welcome_notice",
      `Welcome, ${userData?.name || "User"}!`
    );
    navigate("/dashboard");
  };

  return (
    <div className="main-content-common">
      <div className="onboarding-container">
        <div className="onboarding-wrapper">
          {/* Header */}
          <div className="onboarding-header">
            <div className="onboarding-title">
              <h1>Welcome, {userData?.name || "User"}! 👋</h1>
              <p>Let's get your company set up</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="onboarding-content">
            <div className="row">
              {/* Left Side - Info */}
              <div className="col-md-6 d-none d-md-flex align-items-center">
                <div className="onboarding-info">
                  <div className="info-card">
                    <div className="info-icon">🏢</div>
                    <h3>Company Details</h3>
                    <p>
                      Tell us about your company so we can personalize your
                      experience.
                    </p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">⚙️</div>
                    <h3>Tailored Features</h3>
                    <p>
                      Get features and tools specifically designed for your
                      industry.
                    </p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">⏭️</div>
                    <h3>Skip Anytime</h3>
                    <p>You can skip now and add details later from settings.</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="col-md-6">
                <div className="card-ui onboarding-form-card">
                  <form onSubmit={handleSubmit}>
                    {/* Company Name */}
                    <div className="mb-3">
                      <label className="form-label required">
                        Company Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Acme Corporation"
                      />
                    </div>

                    {/* Website */}
                    <div className="mb-3">
                      <label className="form-label">Website</label>
                      <input
                        type="url"
                        className="form-control"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    {/* Country */}
                    <div className="mb-3">
                      <label className="form-label required">Country</label>
                      <select
                        className="form-select"
                        name="country"
                        value={selectedCountryCode}
                        onChange={handleCountryChange}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div className="mb-3">
                      <label className="form-label required">State</label>
                      <select
                        className="form-select"
                        name="state"
                        value={selectedStateCode}
                        onChange={handleStateChange}
                        disabled={!selectedCountryCode}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={`${state.countryCode}-${state.isoCode}`} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div className="mb-3">
                      <label className="form-label required">City</label>
                      <select
                        className="form-select"
                        name="city"
                        value={formData.city}
                        onChange={handleCityChange}
                        disabled={!selectedStateCode}
                      >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                          <option key={`${city.stateCode}-${city.name}-${index}`} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Number */}
                    <div className="mb-3">
                      <label className="form-label required">Contact Number</label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          style={{ maxWidth: "150px" }}
                          value={selectedPhoneCode}
                          onChange={(e) => setSelectedPhoneCode(e.target.value)}
                        >
                          {countries
                            .filter((country) => Boolean(country.phonecode))
                            .map((country) => {
                              const code = `+${country.phonecode}`;
                              return (
                                <option key={`${country.isoCode}-${code}`} value={code}>
                                  {country.isoCode} ({code})
                                </option>
                              );
                            })}
                        </select>
                        <input
                          type="tel"
                          className="form-control"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          placeholder="e.g., 5551234567"
                        />
                      </div>
                    </div>

                    {/* Platform Type */}
                    <div className="mb-3">
                      <label className="form-label required">
                        Platform Type
                      </label>
                      <select
                        className="form-select"
                        name="platform_type_id"
                        value={formData.platform_type_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Platform Type</option>
                        {platforms.map((platform) => (
                          <option key={platform.id} value={platform.id}>
                            {platform.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Industry Type */}
                    <div className="mb-3">
                      <label className="form-label required">
                        Industry Type
                      </label>
                      <select
                        className="form-select"
                        name="industry_type_id"
                        value={formData.industry_type_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Industry Type</option>
                        {industries.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Role (Optional) */}
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="">Select Role (Optional)</option>
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Team Size (Optional) */}
                    <div className="mb-3">
                      <label className="form-label">Team Size</label>
                      <select
                        className="form-select"
                        name="team_size"
                        value={formData.team_size}
                        onChange={handleChange}
                      >
                        <option value="">Select Team Size (Optional)</option>
                        {teamSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="button-group mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 mb-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Setting up...
                          </>
                        ) : (
                          "Complete Setup"
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={handleSkip}
                        disabled={loading}
                      >
                        Skip for Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .onboarding-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .onboarding-wrapper {
          width: 100%;
          max-width: 1200px;
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .onboarding-title h1 {
          color: white;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .onboarding-title p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
        }

        .onboarding-content {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 40px 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .onboarding-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-card {
          text-align: center;
          padding: 20px;
          background: #2a2a2a;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #333;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
          border-color: #007bff;
        }

        .info-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .info-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .info-card p {
          font-size: 13px;
          color: #b3b3b3;
          margin: 0;
        }

        .onboarding-form-card {
          padding: 30px;
          background: #1e1e1e;
        }

        .form-label {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .form-label.required::after {
          content: " *";
          color: #dc2626;
        }

        .form-control,
        .form-select {
          padding: 10px 12px;
          border: 1px solid #333;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #0a0a0a;
          color: #ffffff;
        }

        .form-control::placeholder {
          color: #666666;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
        }

        .form-select option {
          background: #1e1e1e;
          color: #ffffff;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn {
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          transition: all 0.3s ease;
          color: white;
        }

        .btn-primary {
          background: #007bff;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 123, 255, 0.3);
          background: #0056b3;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-outline-secondary {
          color: #ffffff;
          border: 2px solid #333;
          background: transparent;
        }

        .btn-outline-secondary:hover:not(:disabled) {
          border-color: #007bff;
          color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }

        .btn-outline-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .onboarding-title h1 {
            font-size: 24px;
          }

          .onboarding-content {
            padding: 20px 15px;
          }

          .onboarding-form-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyOnboarding;
