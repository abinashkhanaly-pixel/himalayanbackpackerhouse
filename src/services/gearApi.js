const API_URL = "https://backpacker-gateways-2.onrender.com/api/gears";

// GET ALL GEARS
export const getGears = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = query.toString()
    ? `${API_URL}?${query.toString()}`
    : API_URL;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch gears");
  }

  return response.json();
};

// GET SINGLE GEAR
export const getGearById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch gear");
  }

  return response.json();
};

// CREATE GEAR
export const createGear = async (gearData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gearData),
  });

  if (!response.ok) {
    throw new Error("Failed to create gear");
  }

  return response.json();
};

// UPDATE GEAR
export const updateGear = async (id, gearData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gearData),
  });

  if (!response.ok) {
    throw new Error("Failed to update gear");
  }

  return response.json();
};

// DELETE GEAR
export const deleteGear = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete gear");
  }

  return response.json();
};
