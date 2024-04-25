import { HttpService } from "@rbxts/services";
import type { ApiEndpoints, ApiPaths } from "./api/endpoints";

interface ApiOptions<P extends ApiPaths> {
	method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
	body?: ApiData<P>;
}

type ApiData<P extends ApiPaths, E extends ApiEndpoints = ApiEndpoints> = E extends E
	? E["path"] extends P
		? E["data"]
		: never
	: never;

export class ApiClient {
	private api<P extends ApiPaths>(url: P, options: ApiOptions<P>) {
		const result = HttpService.RequestAsync({
			Url: `https://discord.com/api/v10${url}`,
			Body: options.body ? HttpService.JSONEncode(options.body) : undefined,
			Method: options.method,
			Headers: {
				"Content-Type": "application/json",
				Authorization: this.token,
			},
		});

		if (!result.Success) {
			error(`${result.StatusCode} ${result.StatusMessage}`);
		}
	}

	constructor(
		private token: string,
		public appId: string,
	) {}

	public get<P extends ApiPaths>(url: P) {
		return this.api(url, { method: "GET" });
	}

	public post<P extends ApiPaths>(url: P, body: ApiData<P>) {
		return this.api(url, { method: "POST", body });
	}

	public put<P extends ApiPaths>(url: P, body: ApiData<P>) {
		return this.api(url, { method: "PUT", body });
	}

	public patch<P extends ApiPaths>(url: P, body: ApiData<P>) {
		return this.api(url, { method: "PATCH", body });
	}
}
