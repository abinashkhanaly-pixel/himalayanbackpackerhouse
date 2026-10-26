
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://backpacker-gateways-2.onrender.com/api"
).replace(/\/+$/, "");

let cachedRate = null;
let cachedAt = 0;
let pendingRequest = null;

const CLIENT_CACHE_MS = 30 * 60 * 1000;

export async function getExchangeRate() {
  if (
    cachedRate &&
    Date.now() - cachedAt < CLIENT_CACHE_MS
  ) {
    return cachedRate;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/exchange-rate`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(
          `Exchange rate request failed (${response.status})`
        );
      }

      const data = await response.json();
      const rate = Number(data?.nprPerUsd);

      if (
        data?.success !== true ||
        !Number.isFinite(rate) ||
        rate <= 0
      ) {
        throw new Error("Invalid exchange rate");
      }

      cachedRate = {
        nprPerUsd: rate,
        rateDate: data.rateDate || null,
        source: data.source || null,
      };

      cachedAt = Date.now();

      return cachedRate;
    } catch (error) {
      // Keep the last successfully received rate
      // available during a temporary network failure.
      if (cachedRate) {
        return cachedRate;
      }

      throw error;
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

export function formatNPR(value) {
  const amount = Number(value) || 0;

  return `NPR ${amount.toLocaleString("en-NP", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatUSD(value, nprPerUsd) {
  const amount = Number(value);
  const rate = Number(nprPerUsd);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    return "";
  }

  return `≈ $${(amount / rate).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
