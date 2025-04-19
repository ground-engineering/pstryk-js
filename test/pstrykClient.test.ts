import {
  PstrykClient,
  QueryParams,
  MeterCarbonFootprintResponse,
  MeterPowerCostResponse,
  MeterPowerAggregatorResponse,
  TgePricingResponse,
} from "../src/pstrykClient";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as assert from "assert";

describe("PstrykClient", () => {
  let client: PstrykClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = new PstrykClient("test-token");
    // Mock the client's axiosInstance
    mock = new MockAdapter((client as any).axiosInstance);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should throw an error if apiToken is not provided", () => {
    try {
      new PstrykClient("");
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.strictEqual((error as Error).message, "API token is required");
    }
  });

  it("should get carbon footprint data successfully", async () => {
    const params: Omit<QueryParams, "resolution"> & {
      resolution: "hour" | "day" | "week" | "month";
    } = {
      resolution: "day",
      window_start: "2025-04-18T00:00:00Z",
      window_end: "2025-04-19T00:00:00Z",
      for_tz: "Europe/Warsaw",
    };
    const mockResponse: MeterCarbonFootprintResponse = {
      resolution: "day",
      frames: [
        {
          start: "2025-04-18T00:00:00Z",
          end: "2025-04-19T00:00:00Z",
          is_live: false,
          carbon_footprint: 123.45,
        },
      ],
      carbon_footprint_total: 123.45,
    };
    mock
      .onGet("/integrations/meter-data/carbon-footprint/", { params })
      .reply(200, mockResponse);

    const response = await client.getCarbonFootprint(params);
    assert.deepStrictEqual(response, mockResponse);
  });

  it("should get energy cost data successfully", async () => {
    const params: Omit<QueryParams, "resolution"> & {
      resolution: "hour" | "day" | "week" | "month";
    } = {
      resolution: "day",
      window_start: "2025-04-18T00:00:00Z",
      window_end: "2025-04-19T00:00:00Z",
      for_tz: "Europe/Warsaw",
    };
    const mockResponse: MeterPowerCostResponse = {
      resolution: "day",
      frames: [
        {
          start: "2025-04-18T00:00:00Z",
          end: "2025-04-19T00:00:00Z",
          is_live: false,
          fae_cost: 50.0,
          energy_sold_value: 20.0,
          energy_balance_value: 30.0,
        },
      ],
      fae_total_cost: 50.0,
      total_energy_sold_value: 20.0,
      total_energy_balance_value: 30.0,
    };
    mock
      .onGet("/integrations/meter-data/energy-cost/", { params })
      .reply(200, mockResponse);

    const response = await client.getEnergyCost(params);
    assert.deepStrictEqual(response, mockResponse);
  });

  it("should get energy usage data successfully", async () => {
    const params: QueryParams = {
      resolution: "day",
      window_start: "2025-04-18T00:00:00Z",
      window_end: "2025-04-19T00:00:00Z",
      for_tz: "Europe/Warsaw",
    };
    const mockResponse: MeterPowerAggregatorResponse = {
      resolution: "day",
      frames: [
        {
          start: "2025-04-18T00:00:00Z",
          end: "2025-04-19T00:00:00Z",
          is_live: false,
          fae_usage: 100.0,
          rae: 20.0,
          energy_balance: 80.0,
        },
      ],
      fae_total_usage: 100.0,
      rae_total: 20.0,
      energy_balance: 80.0,
    };
    mock
      .onGet("/integrations/meter-data/energy-usage/", { params })
      .reply(200, mockResponse);

    const response = await client.getEnergyUsage(params);
    assert.deepStrictEqual(response, mockResponse);
  });

  it("should get pricing data successfully", async () => {
    const params: Omit<QueryParams, "resolution"> & {
      resolution: "hour" | "day" | "month" | "year";
    } = {
      resolution: "day",
      window_start: "2025-04-18T00:00:00Z",
      window_end: "2025-04-19T00:00:00Z",
      for_tz: "Europe/Warsaw",
    };
    const mockResponse: TgePricingResponse = {
      price_net_avg: 0.5,
      price_gross_avg: 0.6,
      frames: [
        {
          start: "2025-04-18T00:00:00Z",
          end: "2025-04-19T00:00:00Z",
          is_live: false,
          is_cheap: true,
          is_expensive: false,
          price_net_avg: 0.5,
          price_gross_avg: 0.6,
        },
      ],
    };
    mock.onGet("/integrations/pricing/", { params }).reply(200, mockResponse);

    const response = await client.getPricing(params);
    assert.deepStrictEqual(response, mockResponse);
  });

  it("should get prosumer pricing data successfully", async () => {
    const params: Omit<QueryParams, "resolution"> & {
      resolution: "hour" | "day" | "month" | "year";
    } = {
      resolution: "day",
      window_start: "2025-04-18T00:00:00Z",
      window_end: "2025-04-19T00:00:00Z",
      for_tz: "Europe/Warsaw",
    };
    const mockResponse: TgePricingResponse = {
      price_net_avg: 0.4,
      price_gross_avg: 0.48,
      frames: [
        {
          start: "2025-04-18T00:00:00Z",
          end: "2025-04-19T00:00:00Z",
          is_live: false,
          is_cheap: false,
          is_expensive: true,
          price_net_avg: 0.4,
          price_gross_avg: 0.48,
        },
      ],
    };
    mock
      .onGet("/integrations/prosumer-pricing/", { params })
      .reply(200, mockResponse);

    const response = await client.getProsumerPricing(params);
    assert.deepStrictEqual(response, mockResponse);
  });

  it("should handle API errors", async () => {
    const params: Omit<QueryParams, "resolution"> & {
      resolution: "hour" | "day" | "week" | "month";
    } = {
      resolution: "day",
      window_start: "2025-04-18T00:00:00Z",
      window_end: "2025-04-19T00:00:00Z",
      for_tz: "Europe/Warsaw",
    };
    mock
      .onGet("/integrations/meter-data/carbon-footprint/", { params })
      .reply(404, { error: "Not found" });

    try {
      await client.getCarbonFootprint(params);
      assert.fail("Should have thrown an error");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        assert.strictEqual(error.response?.status, 404);
      } else {
        assert.fail("Error is not an Axios error");
      }
    }
  });
});
