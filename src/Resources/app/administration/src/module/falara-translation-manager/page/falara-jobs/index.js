const { Component } = Shopware;

Component.register('falara-jobs', {
    template: `
        <div class="falara-jobs">
            <mt-card :title="$t('falara-translation-manager.jobs.title')">
                <div class="falara-jobs__toolbar">
                    <mt-switch
                        :label="$t('falara-translation-manager.jobs.showArchived')"
                        v-model="showArchived"
                        @change="loadJobs"
                    />
                    <span class="falara-jobs__auto-refresh">{{ $t('falara-translation-manager.jobs.autoRefresh') }}</span>
                </div>

                <mt-loader v-if="isLoading" />

                <div v-else>
                    <div v-if="jobs.length === 0">
                        <p>{{ $t('falara-translation-manager.jobs.noJobs') }}</p>
                    </div>

                    <div v-else>
                        <div v-for="(batchJobs, batchId) in groupedJobs" :key="batchId" class="falara-jobs__batch">
                            <div class="falara-jobs__batch-header">
                                <strong>{{ $t('falara-translation-manager.jobs.batchLabel') }}: {{ batchId }}</strong>
                                <span class="falara-jobs__batch-count">({{ batchJobs.length }})</span>
                            </div>
                            <table class="falara-jobs__table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('falara-translation-manager.jobs.type') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.status') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.sourceLanguage') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.targetLanguage') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.itemCount') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.createdAt') }}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="job in batchJobs" :key="job.id" class="falara-jobs__row">
                                        <td>{{ job.contentType }}</td>
                                        <td><falara-status-badge :status="job.status" /></td>
                                        <td>{{ job.sourceLanguage }}</td>
                                        <td>{{ job.targetLanguage }}</td>
                                        <td>{{ job.itemCount }}</td>
                                        <td>{{ formatDate(job.createdAt) }}</td>
                                        <td class="falara-jobs__actions">
                                            <mt-button variant="ghost" size="small" @click="viewJob(job.id)">
                                                {{ $t('falara-translation-manager.jobs.viewDetail') }}
                                            </mt-button>
                                            <mt-button
                                                v-if="!job.archived"
                                                variant="ghost"
                                                size="small"
                                                @click="archiveJob(job.id)"
                                            >
                                                {{ $t('falara-translation-manager.jobs.archive') }}
                                            </mt-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </mt-card>
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

    computed: {
        groupedJobs() {
            const groups = {};
            this.jobs.forEach(job => {
                const batchId = job.batchId || job.id;
                if (!groups[batchId]) {
                    groups[batchId] = [];
                }
                groups[batchId].push(job);
            });
            return groups;
        },
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
                this.jobs = resp.data?.items || [];
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
            this.$router.push({ name: 'falara.translation.manager.job.detail', params: { id: jobId } });
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
