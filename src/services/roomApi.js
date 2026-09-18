const API_URL =
  "https://backpacker-gateways-2.onrender.com/api/rooms";

// ==========================================
// FETCH HELPER
// ==========================================
const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeout);

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed (${response.status})`
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out or was cancelled"
      );
    }

    throw error;
  }
};

// ==========================================
// GET ALL ROOMS
// ==========================================
export const getRooms = async ({
  destination = "",
  checkIn = "",
  checkOut = "",
  guests = "",
} = {}) => {
  const params = new URLSearchParams();

  if (destination.trim()) {
    params.append(
      "destination",
      destination.trim()
    );
  }

  if (checkIn) {
    params.append("checkIn", checkIn);
  }

  if (checkOut) {
    params.append("checkOut", checkOut);
  }

  if (guests) {
    params.append("guests", guests);
  }

  const query = params.toString();

  const url = query
    ? `${API_URL}?${query}`
    : API_URL;

  return await fetchJson(url, {
    method: "GET",
    cache: "no-store",
  });
};

// ==========================================
// GET ROOM BY MONGODB ID
// ==========================================
export const getRoom = async (id) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  return await fetchJson(
    `${API_URL}/${encodeURIComponent(id)}`
  );
};

// ==========================================
// GET ROOM BY SEO SLUG
// ==========================================
export const getRoomBySlug = async (slug) => {
  if (!slug) {
    throw new Error(
      "Room SEO slug is required"
    );
  }

  const cleanSlug = slug
    .trim()
    .toLowerCase();

  return await fetchJson(
    `${API_URL}/slug/${encodeURIComponent(cleanSlug)}`
  );
};

// ==========================================
// UPLOAD ROOM IMAGE
// ==========================================
export const uploadRoomImage = async (file) => {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const formData = new FormData();

  formData.append("image", file);

  return await fetchJson(
    `${API_URL}/upload-image`,
    {
      method: "POST",
      body: formData,
    }
  );
};

// ==========================================
// CREATE ROOM
// ==========================================
export const createRoom = async (roomData) => {
  return await fetchJson(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });
};

// ==========================================
// UPDATE ROOM
// ==========================================
export const updateRoom = async (
  id,
  roomData
) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  return await fetchJson(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    }
  );
};

// ==========================================
// DELETE ROOM
// ==========================================
export const deleteRoom = async (id) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  return await fetchJson(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
};