const API_URL =
  "https://backpacker-gateways-2.onrender.com/api/rooms";

// ==========================================
// FETCH HELPER
// ==========================================

const fetchJson = async (url, options = {}) => {
  const MAX_RETRIES = 1;
  const TIMEOUT_MS = 30000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();

    // Respect an externally supplied AbortSignal
    let abortHandler;

    if (options.signal) {
      if (options.signal.aborted) {
        throw new Error("Request was cancelled");
      }

      abortHandler = () => controller.abort();

      options.signal.addEventListener(
        "abort",
        abortHandler,
        { once: true }
      );
    }

    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (options.signal && abortHandler) {
        options.signal.removeEventListener(
          "abort",
          abortHandler
        );
      }

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

      if (options.signal && abortHandler) {
        options.signal.removeEventListener(
          "abort",
          abortHandler
        );
      }

      // ==========================================
      // USER / COMPONENT CANCELLED REQUEST
      // ==========================================

      if (
        options.signal?.aborted &&
        error.name === "AbortError"
      ) {
        throw new Error("Request was cancelled");
      }

      // ==========================================
      // TIMEOUT
      // ==========================================

      if (error.name === "AbortError") {
        if (attempt < MAX_RETRIES) {
          console.warn(
            `Room API timeout. Retrying... (${attempt + 1}/${MAX_RETRIES})`
          );

          continue;
        }

        throw new Error(
          "The server is taking longer than expected. Please try again."
        );
      }

      // ==========================================
      // NETWORK ERROR
      // ==========================================

      if (
        error instanceof TypeError &&
        attempt < MAX_RETRIES
      ) {
        console.warn(
          `Room API network error. Retrying... (${attempt + 1}/${MAX_RETRIES})`
        );

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to complete the request."
  );
};

// ==========================================
// GET ALL ROOMS
// ==========================================

export const getRooms = async ({
  destination = "",
  checkIn = "",
  checkOut = "",
  guests = "",
  signal,
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
    signal,
  });
};

// ==========================================
// GET ROOM BY MONGODB ID
// ==========================================

export const getRoom = async (
  id,
  options = {}
) => {
  if (!id) {
    throw new Error("Room ID is required");
  }

  return await fetchJson(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      ...options,
    }
  );
};

// ==========================================
// GET ROOM BY SEO SLUG
// ==========================================

export const getRoomBySlug = async (
  slug,
  options = {}
) => {
  if (!slug) {
    throw new Error(
      "Room SEO slug is required"
    );
  }

  const cleanSlug = slug
    .trim()
    .toLowerCase();

  return await fetchJson(
    `${API_URL}/slug/${encodeURIComponent(cleanSlug)}`,
    {
      method: "GET",
      ...options,
    }
  );
};

// ==========================================
// UPLOAD ROOM IMAGE
// ==========================================

export const uploadRoomImage = async (file) => {
  if (!file) {
    throw new Error(
      "Please select an image."
    );
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

export const createRoom = async (
  roomData
) => {
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
    throw new Error(
      "Room ID is required"
    );
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
    throw new Error(
      "Room ID is required"
    );
  }

  return await fetchJson(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
};