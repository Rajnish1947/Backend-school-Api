


const School = require('../models/schoolModel.js');

// Haversine formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = angle => (angle * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const createSchool = async (req, res) => {
  try {
    let { name, address, latitude, longitude } = req.body;
    let errors = [];

    if (!name) errors.push("Name is required.");
    if (!address) errors.push("Address is required.");
    if (latitude === undefined) errors.push("Latitude is required.");
    if (longitude === undefined) errors.push("Longitude is required.");

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (isNaN(latitude) || latitude < -90 || latitude > 90)
      errors.push("Latitude must be between -90 and 90.");
    if (isNaN(longitude) || longitude < -180 || longitude > 180)
      errors.push("Longitude must be between -180 and 180.");

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed.", errors });
    }

    const newSchool = new School({ name, address, latitude, longitude });
    await newSchool.save();

    res.status(201).json({ message: "School added successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error.", error: err.message });
  }
};

const listSchools = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    let errors = [];

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    if (isNaN(userLat) || userLat < -90 || userLat > 90)
      errors.push("Latitude must be between -90 and 90.");
    if (isNaN(userLon) || userLon < -180 || userLon > 180)
      errors.push("Longitude must be between -180 and 180.");

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed.", errors });
    }

    const schools = await School.find();

    const sortedSchools = schools
      .map(school => ({
        ...school.toObject(),
        distance: haversineDistance(userLat, userLon, school.latitude, school.longitude)
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (err) {
    res.status(500).json({ message: "Internal server error.", error: err.message });
  }
};

module.exports = { createSchool, listSchools };

