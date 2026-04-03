const { Application } = Shopware;

class FalaraApiService {
    constructor(httpClient, loginService, basePath = '_action/falara') {
        this.httpClient = httpClient;
        this.loginService = loginService;
        this.basePath = basePath;
        this.name = 'falaraApiService';
    }

    getHeaders() {
        return {
            Authorization: `Bearer ${this.loginService.getToken()}`,
            'Content-Type': 'application/json',
        };
    }

    connect(salesChannelId, apiKey) {
        return this.httpClient.post(
            `${this.basePath}/connection/connect`,
            { salesChannelId, apiKey },
            { headers: this.getHeaders() }
        );
    }

    disconnect(salesChannelId) {
        return this.httpClient.post(
            `${this.basePath}/connection/disconnect`,
            { salesChannelId },
            { headers: this.getHeaders() }
        );
    }

    getConnection(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/connection/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }

    getUsage(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/connection/${salesChannelId}/usage`,
            { headers: this.getHeaders() }
        );
    }

    getContentItems(salesChannelId, type, params = {}) {
        const query = new URLSearchParams({ salesChannelId, type, ...params }).toString();
        return this.httpClient.get(
            `${this.basePath}/content?${query}`,
            { headers: this.getHeaders() }
        );
    }

    translate(data) {
        return this.httpClient.post(
            `${this.basePath}/translate`,
            data,
            { headers: this.getHeaders() }
        );
    }

    getJobs(salesChannelId, params = {}) {
        const query = new URLSearchParams({ salesChannelId, ...params }).toString();
        return this.httpClient.get(
            `${this.basePath}/jobs?${query}`,
            { headers: this.getHeaders() }
        );
    }

    getJob(jobId) {
        return this.httpClient.get(
            `${this.basePath}/jobs/${jobId}`,
            { headers: this.getHeaders() }
        );
    }

    retryWriteBack(jobId) {
        return this.httpClient.post(
            `${this.basePath}/jobs/${jobId}/retry-writeback`,
            {},
            { headers: this.getHeaders() }
        );
    }

    archiveJob(jobId) {
        return this.httpClient.post(
            `${this.basePath}/jobs/${jobId}/archive`,
            {},
            { headers: this.getHeaders() }
        );
    }

    runAudit(salesChannelId) {
        return this.httpClient.post(
            `${this.basePath}/audit`,
            { salesChannelId },
            { headers: this.getHeaders() }
        );
    }

    getDefaults(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/${salesChannelId}/defaults`,
            { headers: this.getHeaders() }
        );
    }

    saveDefaults(salesChannelId, data) {
        return this.httpClient.post(
            `${this.basePath}/settings/${salesChannelId}/defaults`,
            data,
            { headers: this.getHeaders() }
        );
    }

    getGlossaries(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/${salesChannelId}/glossaries`,
            { headers: this.getHeaders() }
        );
    }

    getCustomFields(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/${salesChannelId}/custom-fields`,
            { headers: this.getHeaders() }
        );
    }

    saveCustomFields(salesChannelId, fields) {
        return this.httpClient.post(
            `${this.basePath}/settings/${salesChannelId}/custom-fields`,
            { fields },
            { headers: this.getHeaders() }
        );
    }
}

Application.addServiceProvider('falaraApiService', (container) => {
    const initContainer = Application.getContainer('init');
    return new FalaraApiService(
        initContainer.httpClient,
        container.loginService
    );
});
