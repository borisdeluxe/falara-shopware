const { Component } = Shopware;

Component.register('falara-jobs', {
    template: `
        <div>
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <div :style="{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }">
                    <h2 :style="{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }">Translation Jobs</h2>

                    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }">
                        <label :style="{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }">
                            <input
                                type="checkbox"
                                v-model="showArchived"
                                @change="loadJobs"
                                :style="{ width: '16px', height: '16px', cursor: 'pointer' }"
                            />
                            Show Archived
                        </label>
                        <span :style="{ fontSize: '13px', color: '#9ca3af' }">Auto-refreshing every 5s</span>
                    </div>

                    <div v-if="isLoading" :style="{ textAlign: 'center', padding: '40px', color: '#6b7280' }">
                        Loading...
                    </div>

                    <div v-else-if="jobs.length === 0" :style="{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af', fontSize: '15px' }">
                        No translation jobs yet
                    </div>

                    <div v-else :style="{ overflowX: 'auto' }">
                        <table :style="{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }">
                            <thead>
                                <tr :style="{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }">
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Project</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Type</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Target</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Items</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Words</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Status</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Created</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(job, index) in jobs"
                                    :key="job.id"
                                    :style="{ background: index % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }"
                                >
                                    <td :style="{ padding: '10px 14px', color: '#374151', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">
                                        {{ job.projectName || '-' }}
                                    </td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.resourceType }}</td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.targetLocale }}</td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.resourceCount }}</td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.wordCount }}</td>
                                    <td :style="{ padding: '10px 14px' }">
                                        <falara-status-badge :status="job.status" />
                                    </td>
                                    <td :style="{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }">{{ formatDate(job.createdAt) }}</td>
                                    <td :style="{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }">
                                        <button
                                            @click="viewJob(job.id)"
                                            :style="{ padding: '4px 12px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', cursor: 'pointer' }"
                                        >
                                            View
                                        </button>
                                        <button
                                            v-if="!job.archived"
                                            @click="archiveJob(job.id)"
                                            :style="{ padding: '4px 12px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#6b7280', cursor: 'pointer' }"
                                        >
                                            Archive
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            isLoading: false,
            jobs: [],
            showArchived: false,
            salesChannelId: null,
            pollInterval: null,
        };
    },

    created() {
        this.initSalesChannel();
    },

    beforeUnmount() {
        this.stopPolling();
    },

    methods: {
        async initSalesChannel() {
            const salesChannelRepository = Shopware.Service('repositoryFactory').create('sales_channel');
            const salesChannels = await salesChannelRepository.search(
                new Shopware.Data.Criteria(),
                Shopware.Context.api
            );
            if (salesChannels.length > 0) {
                this.salesChannelId = salesChannels.first().id;
                await this.loadJobs();
                this.startPolling();
            }
        },

        async loadJobs() {
            if (!this.salesChannelId) return;
            this.isLoading = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const params = { archived: this.showArchived ? '1' : '0' };
                const resp = await falaraApiService.getJobs(this.salesChannelId, params);
                this.jobs = resp.data?.jobs || resp.data?.items || [];
            } catch (e) {
                this.jobs = [];
            } finally {
                this.isLoading = false;
            }
        },

        startPolling() {
            this.pollInterval = setInterval(() => {
                this.loadJobs();
            }, 5000);
        },

        stopPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
        },

        viewJob(jobId) {
            this..push({ name: 'falara.translation.manager.job.detail', params: { id: jobId } });
        },

        async archiveJob(jobId) {
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.archiveJob(jobId);
                await this.loadJobs();
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString();
        },
    },
});
