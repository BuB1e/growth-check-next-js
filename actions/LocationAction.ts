import { EnvConfig } from "@/configs/BackendConfig";
import { LocationResponse } from "@/dto";

export class LocationAction {
    static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
    static API_ENDPOINT = "";
    static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

    static async getLocation({id} : {id: number}) : Promise<LocationResponse> {
        const response = await fetch(this.ACTION_ENDPOINT + `/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    }
}