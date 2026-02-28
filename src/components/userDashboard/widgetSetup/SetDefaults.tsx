import React, { useState } from "react";

interface SetDefaultsProps {
  onCancel: () => void;
}

const SetDefaults: React.FC<SetDefaultsProps> = () => {
  const [defaults, setDefaults] = useState({
    language: "en",
    timezone: "UTC",
    notifications: true,
    darkMode: false,
    exportFormat: "pdf",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setDefaults({
        ...defaults,
        [name]: checked,
      });
    } else {
      setDefaults({
        ...defaults,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Defaults saved", defaults);
  };

  return (
    <div className="set-defaults">
      <div className="header">
        <h1>Set Defaults</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-field">
            <label htmlFor="language">Default Language</label>
            <select
              id="language"
              name="language"
              value={defaults.language}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="timezone">Default Timezone</label>
            <select
              id="timezone"
              name="timezone"
              value={defaults.timezone}
              onChange={handleChange}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Standard Time</option>
              <option value="CST">Central Standard Time</option>
              <option value="MST">Mountain Standard Time</option>
              <option value="PST">Pacific Standard Time</option>
              <option value="CET">Central European Time</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="form-field checkbox-field">
            <label htmlFor="notifications">Enable Notifications</label>
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={defaults.notifications}
              onChange={handleChange}
            />
          </div>
          <div className="form-field checkbox-field">
            <label htmlFor="darkMode">Dark Mode</label>
            <input
              type="checkbox"
              id="darkMode"
              name="darkMode"
              checked={defaults.darkMode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-field">
            <label htmlFor="exportFormat">Default Export Format</label>
            <select
              id="exportFormat"
              name="exportFormat"
              value={defaults.exportFormat}
              onChange={handleChange}
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button">
            CANCEL
          </button>
          <button type="submit" className="save-button">
            SAVE DEFAULTS
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetDefaults;
