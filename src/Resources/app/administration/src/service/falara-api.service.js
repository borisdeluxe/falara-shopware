const { Application } = Shopware;

class FalaraApiService {
    constructor(httpClient, loginService) {
        this.httpClient = httpClient;
        this.loginService = loginService;
        this.basePath = "_action/falara";
    }

    getHeaders() {
        return {
            Authorization: `Bearer ${this.loginService.getToken()}`,
            "Content-Type": "application/json",
        };
    }

    connect(salesChannelId, apiKey) {
        return this.httpClient.post(
            `${this.basePath}/connect`,
            { salesChannelId, apiKey },
            { headers: this.getHeaders() }
        );
    }

    disconnect(salesChannelId) {
        return this.httpClient.post(
            `${this.basePath}/disconnect`,
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
            `${this.basePath}/settings/usage/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }

    getContentItems(salesChannelId, type, params = {}) {
        return this.httpClient.get(
            `${this.basePath}/content/${salesChannelId}/${type}`,
            { params, headers: this.getHeaders() }
        );
    }

    getContentTypes() {
        return this.httpClient.get(
            `${this.basePath}/content-types`,
            { headers: this.getHeaders() }
        );
    }

    getSnippetSubgroups(salesChannelId, group) {
        return this.httpClient.get(
            `${this.basePath}/snippet-subgroups/${salesChannelId}`,
            { params: { group }, headers: this.getHeaders() }
        );
    }

    getSnippetGroups(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/snippet-groups/${salesChannelId}`,
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
        return this.httpClient.get(
            `${this.basePath}/jobs/${salesChannelId}`,
            { params, headers: this.getHeaders() }
        );
    }

    getJob(jobId) {
        return this.httpClient.get(
            `${this.basePath}/jobs/detail/${jobId}`,
            { headers: this.getHeaders() }
        );
    }

    retryWriteBack(jobId) {
        return this.httpClient.post(
            `${this.basePath}/jobs/${jobId}/retry`,
            {},
            { headers: this.getHeaders() }
        );
    }

    archiveJob(jobId) {
        return this.httpClient.patch(
            `${this.basePath}/jobs/${jobId}/archive`,
            {},
            { headers: this.getHeaders() }
        );
    }

    runAudit(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/audit/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }

    getDefaults(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/defaults/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }

    saveDefaults(salesChannelId, data) {
        return this.httpClient.post(
            `${this.basePath}/settings/defaults/${salesChannelId}`,
            data,
            { headers: this.getHeaders() }
        );
    }

    getGlossaries(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/glossaries/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }

    getCustomFields(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/custom-fields/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }

    addCustomField(salesChannelId, fieldSetName, fieldName) {
        return this.httpClient.post(
            `${this.basePath}/settings/custom-fields/${salesChannelId}`,
            { fieldSetName, fieldName },
            { headers: this.getHeaders() }
        );
    }

    deleteCustomField(id) {
        return this.httpClient.delete(
            `${this.basePath}/settings/custom-fields/entry/${id}`,
            { headers: this.getHeaders() }
        );
    }

    getAvailableCustomFields(salesChannelId) {
        return this.httpClient.get(
            `${this.basePath}/settings/available-custom-fields/${salesChannelId}`,
            { headers: this.getHeaders() }
        );
    }
}

Application.addServiceProvider("falaraApiService", (container) => {
    const initContainer = Application.getContainer("init");
    return new FalaraApiService(initContainer.httpClient, container.loginService);
});
