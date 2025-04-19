````markdown
# pstryk-js

[![NPM Version](https://img.shields.io/npm/v/pstryk-js.svg)](https://www.npmjs.com/package/pstryk-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 1. Introduction

`pstryk-js` is a lightweight and easy-to-use JavaScript/TypeScript client library for interacting with the [Pstryk API](https://api.pstryk.pl) / [Pstryk](https://www.pstryk.pl/). It simplifies making requests to various Pstryk endpoints for retrieving energy data, costs, carbon footprint, and pricing information associated with your Pstryk account.

This library handles authentication and provides typed methods for interacting with the API endpoints, along with TypeScript interfaces for query parameters and response data structures.

## 2. Installation

You can install `pstryk-js` either from the public npm repository or by using it locally after cloning the source code.

### Using npm (Recommended)

Install the library and its required dependency (`axios`) from the npm public repository:

```bash
npm install pstryk-js axios
# or
yarn add pstryk-js axios
```
````

### Locally (for development or specific use cases)

Clone the repository and install dependencies:

```bash
git clone git@github.com:ground-engineering/pstryk-js.git
cd pstryk-js
npm install
# or
yarn install
```

You can then import the client from the local path in your project.

## 3. Initialization

To use the library, import the `PstrykClient` class and create a new instance, providing your Pstryk API token.

```typescript
import { PstrykClient } from "pstryk-js";

// Obtain your API token from your Pstryk account settings.
const apiToken = "your-pstryk-api-token";

// Initialize the client using the default Pstryk API base URL (https://api.pstryk.pl)
const client = new PstrykClient(apiToken);

// You can also provide a custom base URL if needed (e.g., for testing or different environments)
// const customBaseUrl = 'https://your-custom-pstryk-instance.com';
// const clientWithCustomUrl = new PstrykClient(apiToken, customBaseUrl);

// The client is now ready to make API calls.
```

**Important:** An `apiToken` is **required**. The constructor will throw an `Error` if the token is not provided.

## 4. API Methods

All methods are asynchronous and return a `Promise` that resolves with the corresponding response data based on the Pstryk API schema.

### Common Parameters (`QueryParams`)

Most methods accept a `params` object with the following structure:

- `resolution`: (Required) The aggregation level for the data. Allowed values vary by endpoint (see specific method descriptions below).
- `window_start`: (Required) The beginning of the time window for the query, formatted as a UTC ISO 8601 date-time string (e.g., `'2023-10-26T00:00:00Z'`).
- `window_end`: (Optional) The end of the time window (exclusive) for the query, formatted as a UTC ISO 8601 date-time string. If omitted, the API might use a default or query up to the current time.
- `for_tz`: (Optional) Specifies a target timezone (e.g., `'Europe/Warsaw'`). While timestamps in responses (`start`, `end`) are typically in UTC, this parameter might influence how data is aggregated or presented in some contexts on the server side.

---

### `getCarbonFootprint(params)`

Retrieves aggregated carbon footprint data associated with your meter(s).

- **Endpoint:** `/integrations/meter-data/carbon-footprint/`
- **`params.resolution`**: `'hour' | 'day' | 'week' | 'month'`
- **Returns**: `Promise<MeterCarbonFootprintResponse>` containing frames with `carbon_footprint` (gCO2eq) and a `carbon_footprint_total`.

```typescript
async function fetchCarbonFootprint() {
  try {
    const data = await client.getCarbonFootprint({
      resolution: "day",
      window_start: "2024-01-01T00:00:00Z",
      window_end: "2024-01-31T23:59:59Z",
      // for_tz: 'Europe/Warsaw' // Optional
    });
    console.log(
      "Total Carbon Footprint:",
      data.carbon_footprint_total,
      "gCO2eq"
    );
    console.log("Daily Frames:", data.frames);
    // Example Access: data.frames[0].carbon_footprint
  } catch (error) {
    console.error("Error fetching carbon footprint:", error);
  }
}

fetchCarbonFootprint();
```

---

### `getEnergyCost(params)`

Retrieves aggregated energy cost data, including energy purchased (FAE), energy sold, and the net balance value.

- **Endpoint:** `/integrations/meter-data/energy-cost/`
- **`params.resolution`**: `'hour' | 'day' | 'week' | 'month'`
- **Returns**: `Promise<MeterPowerCostResponse>` containing frames with `fae_cost` (PLN), `energy_sold_value` (PLN), `energy_balance_value` (PLN), and corresponding totals.

```typescript
async function fetchEnergyCost() {
  try {
    const data = await client.getEnergyCost({
      resolution: "month",
      window_start: "2024-01-01T00:00:00Z",
      window_end: "2024-03-31T23:59:59Z",
    });
    console.log(
      "Total Energy Balance Value:",
      data.total_energy_balance_value,
      "PLN"
    );
    console.log("Monthly Cost Frames:", data.frames);
    // Example Access: data.frames[0].fae_cost
  } catch (error) {
    console.error("Error fetching energy cost:", error);
  }
}

fetchEnergyCost();
```

---

### `getEnergyUsage(params)`

Retrieves aggregated energy usage data, including energy purchased (FAE), energy returned to the grid (RAE), and the net energy balance.

- **Endpoint:** `/integrations/meter-data/energy-usage/`
- **`params.resolution`**: `'hour' | 'day' | 'week' | 'month' | 'year'`
- **Returns**: `Promise<MeterPowerAggregatorResponse>` containing frames with `fae_usage` (kWh), `rae` (kWh), `energy_balance` (kWh), and corresponding totals.

```typescript
async function fetchEnergyUsage() {
  try {
    const data = await client.getEnergyUsage({
      resolution: "week",
      window_start: "2024-03-01T00:00:00Z",
      window_end: "2024-03-31T23:59:59Z",
    });
    console.log("Total Energy Balance:", data.energy_balance, "kWh");
    console.log("Weekly Usage Frames:", data.frames);
    // Example Access: data.frames[0].rae
  } catch (error) {
    console.error("Error fetching energy usage:", error);
  }
}

fetchEnergyUsage();
```

---

### `getPricing(params)`

Retrieves TGE (Polish Power Exchange) pricing data relevant for standard meter-based billing (non-prosumer). Useful for understanding dynamic tariffs.

- **Endpoint:** `/integrations/pricing/`
- **`params.resolution`**: `'hour' | 'day' | 'month' | 'year'`
- **Returns**: `Promise<TgePricingResponse>` containing frames with average prices (`price_net_avg`, `price_gross_avg`) for non-hourly resolutions, or specific hourly prices (`price_net`, `price_gross`) for hourly resolution. Also includes flags like `is_cheap`, `is_expensive`.

```typescript
async function fetchPricing() {
  try {
    const data = await client.getPricing({
      resolution: "hour",
      window_start: "2024-04-01T00:00:00Z",
      window_end: "2024-04-01T05:59:59Z",
    });
    console.log(
      "Overall Average Gross Price:",
      data.price_gross_avg,
      "PLN/kWh"
    );
    console.log("Hourly Pricing Frames:", data.frames);
    // Example Access: data.frames[0].price_gross, data.frames[0].is_cheap
  } catch (error) {
    console.error("Error fetching pricing:", error);
  }
}

fetchPricing();
```

---

### `getProsumerPricing(params)`

Retrieves TGE pricing data specifically relevant for prosumer billing rules (e.g., related to net-billing or RCEm in Poland).

- **Endpoint:** `/integrations/prosumer-pricing/`
- **`params.resolution`**: `'hour' | 'day' | 'month' | 'year'`
- **Returns**: `Promise<TgePricingResponse>` (structure is the same as `getPricing`, but the underlying calculation or relevance of the price might differ based on prosumer context).

```typescript
async function fetchProsumerPricing() {
  try {
    const data = await client.getProsumerPricing({
      resolution: "month",
      window_start: "2024-01-01T00:00:00Z",
      window_end: "2024-03-31T23:59:59Z",
    });
    console.log(
      "Overall Prosumer Avg Gross Price:",
      data.price_gross_avg,
      "PLN/kWh"
    );
    console.log("Monthly Prosumer Pricing Frames:", data.frames);
    // Example Access: data.frames[0].price_net_avg
  } catch (error) {
    console.error("Error fetching prosumer pricing:", error);
  }
}

fetchProsumerPricing();
```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
