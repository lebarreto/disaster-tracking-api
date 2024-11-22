const express = require("express");
const axios = require("axios");

const app = express();
const port = 3001;
const API_KEY = "209dd3ca984d4f3c84c184407242211";
const WEATHER_API_KEY = "https://api.weatherapi.com/v1/alerts.json";
const USGS_API =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

app.use(require("cors")());

const fetchWeatherAlerts = async (lat, lng) => {
  try {
    const response = await axios.get(WEATHER_API_KEY, {
      params: {
        key: API_KEY,
        q: `${lat},${lng}`,
      },
    });

    const alerts = response.data.alerts || [];

    if (!Array.isArray(alerts)) {
      console.error("Alerts data is not an array:", alerts);
      return { stormAlerts: [], floodAlerts: [] };
    }

    const stormAlerts = alerts.filter(
      alert =>
        alert.title.toLowerCase().includes("storm") ||
        alert.description.toLowerCase().includes("storm")
    );

    const floodAlerts = alerts.filter(
      alert =>
        alert.title.toLowerCase().includes("flood") ||
        alert.description.toLowerCase().includes("flood")
    );

    return { stormAlerts, floodAlerts };
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    return { stormAlerts: [], floodAlerts: [] };
  }
};

app.get("/api/earthquakes", async (req, res) => {
  try {
    const response = await axios.get(USGS_API);
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    res.status(500).send("Error fetching earthquake data");
  }
});

app.get("/api/storms", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ message: "Please provide latitude and longitude" });
  }

  const { stormAlerts } = await fetchWeatherAlerts(lat, lon);
  res.json({ stormAlerts });
});

app.get("/api/floods", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ message: "Please provide latitude and longitude" });
  }

  const { floodAlerts } = await fetchWeatherAlerts(lat, lon);
  res.json({ floodAlerts });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
