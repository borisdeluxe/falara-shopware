const { Component } = Shopware;

Component.register('falara-dashboard', {
    template: `
        <div class="falara-dashboard">
            <mt-card :title="$t('falara-translation-manager.dashboard.title')">
                <mt-loader v-if="isLoading" />

                <div v-else-if="!isConnected" class="falara-dashboard__not-connected">
                    <h2>{{ $t('falara-translation-manager.dashboard.notConnected') }}</h2>
                    <p>{{ $t('falara-translation-manager.dashboard.notConnectedMessage') }}</p>
                    <mt-button variant="primary" @click="goToSettings">
                        {{ $t('falara-translation-manager.dashboard.connectNow') }}
                    </mt-button>
                </div>

                <div v-else class="falara-dashboard__content">
                    <div class="falara-dashboard__quota-section">
                        <h3>{{ $t('falara-translation-manager.dashboard.quota') }}</h3>
                        <falara-quota-widget v-if="usage" :usage="usage" />
                    </div>

                    <div class="falara-dashboard__stats">
                        <div class="falara-dashboard__stat-card">
                            <span class="falara-dashboard__stat-value">{{ stats.total }}</span>
                            <span class="falara-dashboard__stat-label">{{ $t('falara-translation-manager.dashboard.stats.totalJobs') }}</span>
                        </div>
                        <div class="falara-dashboard__stat-card">
                            <span class="falara-dashboard__stat-value">{{ stats.completed }}</span>
                            <span class="falara-dashboard__stat-label">{{ $t('falara-translation-manager.dashboard.stats.completedJobs') }}</span>
                        </div>
                        <div class="falara-dashboard__stat-card falara-dashboard__stat-card--warning">
                            <span class="falara-dashboard__stat-value">{{ stats.failed }}</span>
                            <span class="falara-dashboard__stat-label">{{ $t('falara-translation-manager.dashboard.stats.failedJobs') }}</span>
                        </div>
                        <div class="falara-dashboard__stat-card">
                            <span class="falara-dashboard__stat-value">{{ stats.pending }}</span>
                            <span class="falara-dashboard__stat-label">{{ $t('falara-translation-manager.dashboard.stats.pendingJobs') }}</span>
                        </div>
                    </div>

                    <div class="falara-dashboard__recent-jobs">
                        <div class="falara-dashboard__section-header">
                            <h3>{{ $t('falara-translation-manager.dashboard.recentJobs') }}</h3>
                            <mt-button variant="ghost" size="small" @click="goToJobs">
                                {{ $t('falara-translation-manager.dashboard.viewAllJobs') }}
                            </mt-button>
                        </div>
                        <table class="falara-dashboard__table" v-if="recentJobs.length > 0">
                            <thead>
                                <tr>
                                    <th>{{ $t('falara-translation-manager.jobs.type') }}</th>
                                    <th>{{ $t('falara-translation-manager.jobs.status') }}</th>
                                    <th>{{ $t('falara-translation-manager.jobs.targetLanguage') }}</th>
                                    <th>{{ $t('falara-translation-manager.jobs.createdAt') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="job in recentJobs" :key="job.id" @click="goToJob(job.id)" class="falara-dashboard__table-row">
                                    <td>{{ job.contentType }}</td>
                                    <td><falara-status-badge :status="job.status" /></td>
                                    <td>{{ job.targetLanguage }}</td>
                                    <td>{{ formatDate(job.createdAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p v-else>{{ $t('falara-translation-manager.jobs.noJobs') }}</p>
                    </div>
                </div>
            </mt-card>
        </div>
    `,

    data() {
        return {
            isLoading: true,
            isConnected: false,
            usage: null,
            recentJobs: [],
            stats: {
                total: 0,
                completed: 0,
                failed: 0,
                pending: 0,
            },
            salesChannelId: null,
        };
    },

    created() {
        this.loadDashboard();
    },

    methods: {
        async loadDashboard() {
            this.isLoading = true;
            try {
                const salesChannelRepository = Shopware.Service('repositoryFactory').create('sales_channel');
                const salesChannels = await salesChannelRepository.search(
                    new Shopware.Data.Criteria(),
                    Shopware.Context.api
                );

                if (salesChannels.length === 0) {
                    this.isConnected = false;
                    return;
                }

                this.salesChannelId = salesChannels.first().id;
                const falaraApiService = Shopware.Service('falaraApiService');

                try {
                    const connResp = await falaraApiService.getConnection(this.salesChannelId);
                    this.isConnected = !!(connResp.data && connResp.data.connection && !connResp.data.connection.disconnectedAt);
                } catch (e) {
                    this.isConnected = false;
                }

                if (this.isConnected) {
                    try {
                        const usageResp = await falaraApiService.getUsage(this.salesChannelId);
                        this.usage = usageResp.data || {};
                    } catch (e) {
                        this.usage = {};
                    }

                    try {
                        const jobsResp = await falaraApiService.getJobs(this.salesChannelId, { limit: 10 });
                        const jobs = jobsResp.data?.items || [];
                        this.recentJobs = jobs.slice(0, 5);
                        this.stats.total = jobs.length;
                        this.stats.completed = jobs.filter(j => ['completed', 'written_back'].includes(j.status)).length;
                        this.stats.failed = jobs.filter(j => ['failed', 'dead', 'writeback_failed'].includes(j.status)).length;
                        this.stats.pending = jobs.filter(j => ['pending', 'queued', 'processing'].includes(j.status)).length;
                    } catch (e) {
                        this.recentJobs = [];
                    }
                }
            } finally {
                this.isLoading = false;
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString();
        },

        goToSettings() {
            this.$router.push({ name: 'falara.translation.manager.settings' });
        },

        goToJobs() {
            this.$router.push({ name: 'falara.translation.manager.jobs' });
        },

        goToJob(jobId) {
            this.$router.push({ name: 'falara.translation.manager.job.detail', params: { id: jobId } });
        },
    },
});
