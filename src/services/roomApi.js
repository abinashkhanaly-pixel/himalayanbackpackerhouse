const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/rooms"
    : "https://backpacker-gateways-2.onrender.com/api/rooms";

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
    params.append("destination", destination.trim());
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

  const url = query ? `${API_URL}?${query}` : API_URL;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch rooms (${response.status})`);
  }

  return await response.json();
};

// ==========================================
// GET ROOM BY MONGODB ID
// ==========================================
export const getRoom = async (id) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch room (${response.status})`);
  }

  return await response.json();
};

// ==========================================
// GET ROOM BY SEO SLUG
// Example:
// /rooms/deluxe-mountain-view-room-kathmandu
// ==========================================
export const getRoomBySlug = async (slug) => {
  if (!slug) {
    throw new Error("Room SEO slug is required");
  }

  const cleanSlug = slug.trim().toLowerCase();

  const response = await fetch(
    `${API_URL}/slug/${encodeURIComponent(cleanSlug)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch room by slug (${response.status})`);
  }

  return await response.json();
};

// ==========================================
// CREATE ROOM
// ==========================================
export const createRoom = async (roomData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to create room (${response.status})`
    );
  }

  return result;
};

// ==========================================
// UPDATE ROOM
// ==========================================
export const updateRoom = async (id, roomData) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to update room (${response.status})`
    );
  }

  return result;
};

// ==========================================
// DELETE ROOM
// ==========================================
export const deleteRoom = async (id) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to delete room (${response.status})`
    );
  }

  return result;
};

