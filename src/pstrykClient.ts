import axios, { AxiosInstance } from "axios";

// Query parameters interface
export interface QueryParams {
    for_tz?: string; // Optional timezone (e.g., 'Europe/Warsaw')
    resolution: "hour" | "day" | "week" | "month" | "year"; // Required, enum varies by endpoint
    window_start: string; // Required, UTC date-time
    window_end?: string; // Optional, UTC date-time
}

// Response interfaces based on Swagger schemas
export interface MeterCarbonFootprintFrame {
    start: string; // UTC date-time
    end: string; // UTC date-time
    is_live: boolean;
    carbon_footprint: number | null; // gCO2eq
}

export interface MeterCarbonFootprintResponse {
    resolution: string;
    frames: MeterCarbonFootprintFrame[];
    carbon_footprint_total: number; // gCO2eq
}

export interface MeterPowerCostFrame {
    start: string; // UTC date-time
    end: string; // UTC date-time
    is_live: boolean;
    fae_cost: number; // PLN
    energy_sold_value: number; // PLN with VAT
    energy_balance_value: number; // PLN
}

export interface MeterPowerCostResponse {
    resolution: string;
    frames: MeterPowerCostFrame[];
    fae_total_cost: number; // PLN
    total_energy_sold_value: number; // PLN
    total_energy_balance_value: number; // PLN
}

export interface MeterPowerUsageFrame {
    start: string; // UTC date-time
    end: string; // UTC date-time
    is_live: boolean;
    fae_usage: number; // kWh
    rae: number; // kWh
    energy_balance: number; // kWh
}

export interface MeterPowerAggregatorResponse {
    resolution: string;
    frames: MeterPowerUsageFrame[];
    fae_total_usage: number; // kWh
    rae_total: number; // kWh
    energy_balance: number; // kWh
}

export interface TgePricingFrame {
    start: string; // UTC date-time
    end: string; // UTC date-time
    is_live: boolean;
    is_cheap: boolean;
    is_expensive: boolean;
    price_net?: number; // PLN/kWh, hourly only
    price_gross?: number; // PLN/kWh, hourly only
    price_net_avg?: number; // PLN/kWh, non-hourly
    price_gross_avg?: number; // PLN/kWh, non-hourly
}

export interface TgePricingResponse {
    price_net_avg: number; // PLN/kWh
    price_gross_avg: number; // PLN/kWh
    frames: TgePricingFrame[];
}

/**
 * Client for interacting with the Pstryk API.
 */
export class PstrykClient {
    private readonly axiosInstance: AxiosInstance;

    /**
     * Initializes a new instance of the PstrykClient.
     * @param apiToken - The API token for authentication (e.g., 'your-token').
     * @param baseUrl - The base URL of the API (defaults to 'https://api.pstryk.pl').
     * @throws {Error} If the API token is not provided.
     */
    constructor(apiToken: string, baseUrl: string = "https://api.pstryk.pl") {
        if (!apiToken) {
            throw new Error("API token is required");
        }

        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 10000,
            headers: {
                Authorization: `sk-${apiToken}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves aggregated carbon footprint data.
     * @param params - Query parameters (resolution: 'hour' | 'day' | 'week' | 'month').
     * @returns Promise resolving to the carbon footprint data.
     */
    public async getCarbonFootprint(
        params: Omit<QueryParams, "resolution"> & {
            resolution: "hour" | "day" | "week" | "month";
        }
    ): Promise<MeterCarbonFootprintResponse> {
        const response = await this.axiosInstance.get("/integrations/meter-data/carbon-footprint/", { params });
        return response.data;
    }

    /**
     * Retrieves aggregated meter power cost data.
     * @param params - Query parameters (resolution: 'hour' | 'day' | 'week' | 'month').
     * @returns Promise resolving to the power cost data.
     */
    public async getEnergyCost(
        params: Omit<QueryParams, "resolution"> & {
            resolution: "hour" | "day" | "week" | "month";
        }
    ): Promise<MeterPowerCostResponse> {
        const response = await this.axiosInstance.get("/integrations/meter-data/energy-cost/", { params });
        return response.data;
    }

    /**
     * Retrieves aggregated meter power usage data.
     * @param params - Query parameters (resolution: 'hour' | 'day' | 'week' | 'month' | 'year').
     * @returns Promise resolving to the power usage data.
     */
    public async getEnergyUsage(params: QueryParams): Promise<MeterPowerAggregatorResponse> {
        const response = await this.axiosInstance.get("/integrations/meter-data/energy-usage/", { params });
        return response.data;
    }

    /**
     * Retrieves pricing data for meter-related authentication tokens.
     * @param params - Query parameters (resolution: 'hour' | 'day' | 'month' | 'year').
     * @returns Promise resolving to the pricing data.
     */
    public async getPricing(
        params: Omit<QueryParams, "resolution"> & {
            resolution: "hour" | "day" | "month" | "year";
        }
    ): Promise<TgePricingResponse> {
        const response = await this.axiosInstance.get("/integrations/pricing/", {
            params,
        });
        return response.data;
    }

    /**
     * Retrieves pricing data for prosumer-related authentication tokens.
     * @param params - Query parameters (resolution: 'hour' | 'day' | 'month' | 'year').
     * @returns Promise resolving to the prosumer pricing data.
     */
    public async getProsumerPricing(
        params: Omit<QueryParams, "resolution"> & {
            resolution: "hour" | "day" | "month" | "year";
        }
    ): Promise<TgePricingResponse> {
        const response = await this.axiosInstance.get("/integrations/prosumer-pricing/", { params });
        return response.data;
    }
}

// Utility type for omitting properties
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
