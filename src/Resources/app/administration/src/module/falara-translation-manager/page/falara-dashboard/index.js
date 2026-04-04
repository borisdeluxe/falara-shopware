const { Component } = Shopware;

Component.register('falara-dashboard', {
    template: `
        <div class="falara-dashboard">
            <falara-nav-tabs />

            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <mt-loader v-if="isLoading" />

                <div v-else-if="!isConnected" :style="cardStyle">
                    <h2 :style="{ fontSize: '20px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }">
                        {{ $t('falara-translation-manager.dashboard.notConnected') }}
                    </h2>
                    <p :style="{ color: '#6b7280', marginBottom: '20px' }">
                        {{ $t('falara-translation-manager.dashboard.notConnectedMessage') }}
                    </p>
                    <mt-button variant="primary" @click="goToSettings">
                        {{ $t('falara-translation-manager.dashboard.connectNow') }}
                    </mt-button>
                </div>

                <div v-else>

                    <!-- Quota Card -->
                    <div :style="cardStyle">
                        <div :style="{ marginBottom: '16px' }">
                            <span :style="{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }">
                                {{ $t('falara-translation-manager.dashboard.quota') }}
                            </span>
                            <span v-if="usage && usage.plan" :style="{ marginLeft: '8px', fontSize: '11px', background: '#e0e7ff', color: '#3730a3', borderRadius: '4px', padding: '2px 8px', fontWeight: '600' }">
                                {{ usage.plan }}
                            </span>
                        </div>
                        <falara-quota-widget v-if="usage" :usage="usage" />
                    </div>

                    <!-- Stats Grid -->
                    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }">
                        <div :style="statCardStyle">
                            <span :style="statValueStyle">{{ stats.total }}</span>
                            <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.totalJobs') }}</span>
                        </div>
                        <div :style="statCardStyle">
                            <span :style="{ ...statValueStyle, color: '#16a34a' }">{{ stats.completed }}</span>
                            <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.completedJobs') }}</span>
                        </div>
                        <div :style="statCardStyle">
                            <span :style="{ ...statValueStyle, color: '#dc2626' }">{{ stats.failed }}</span>
                            <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.failedJobs') }}</span>
                        </div>
                        <div :style="statCardStyle">
                            <span :style="{ ...statValueStyle, color: '#d97706' }">{{ stats.pending }}</span>
                            <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.pendingJobs') }}</span>
                        </div>
                    </div>

                    <!-- Recent Jobs -->
                    <div :style="cardStyle">
                        <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }">
                            <span :style="{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }">
                                {{ $t('falara-translation-manager.dashboard.recentJobs') }}
                            </span>
                            <mt-button variant="ghost" size="small" @click="goToJobs">
                                {{ $t('falara-translation-manager.dashboard.viewAllJobs') }}
                            </mt-button>
                        </div>

                        <table v-if="recentJobs.length > 0" :style="tableStyle">
                            <thead>
                                <tr>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.jobs.type') }}</th>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.jobs.status') }}</th>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.jobs.targetLanguage') }}</th>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.jobs.createdAt') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(job, idx) in recentJobs"
                                    :key="job.id"
                                    :style="idx % 2 === 0 ? tdRowEvenStyle : tdRowOddStyle"
                                    @click="goToJob(job.id)"
                                    @mouseenter="$event.currentTarget.style.background = '#f0f4ff'; $event.currentTarget.style.cursor = 'pointer'"
                                    @mouseleave="$event.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f9fafb'; $event.currentTarget.style.cursor = 'default'"
                                >
                                    <td :style="tdStyle">{{ job.contentType }}</td>
                                    <td :style="tdStyle"><falara-status-badge :status="job.status" /></td>
                                    <td :style="tdStyle">{{ job.targetLanguage }}</td>
                                    <td :style="tdStyle">{{ formatDate(job.createdAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p v-else :style="{ color: '#6b7280', fontSize: '14px' }">
                            {{ $t('falara-translation-manager.jobs.noJobs') }}
                        </p>
                    </div>

                </div>
            </div>
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

    computed: {
        cardStyle() {
            return {
                background: '#ffffff',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
                marginBottom: '24px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },
        statCardStyle() {
            return {
                background: '#ffffff',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },
        statValueStyle() {
            return {
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a1a2e',
                lineHeight: '1',
            };
        },
        statLabelStyle() {
            return {
                fontSize: '13px',
                color: '#6b7280',
                fontWeight: '500',
            };
        },
        tableStyle() {
            return {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
            };
        },
        thStyle() {
            return {
                textAlign: 'left',
                padding: '10px 14px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
            };
        },
        tdStyle() {
            return {
                padding: '12px 14px',
                color: '#374151',
                borderBottom: '1px solid #f3f4f6',
                verticalAlign: 'middle',
            };
        },
        tdRowEvenStyle() {
            return { background: '#ffffff' };
        },
        tdRowOddStyle() {
            return { background: '#f9fafb' };
        },
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
                        this.usage = usageResp.data?.usage || usageResp.data || {};
                    } catch (e) {
                        this.usage = {};
                    }

                    try {
                        const jobsResp = await falaraApiService.getJobs(this.salesChannelId, { limit: 10 });
                        const jobs = jobsResp.data?.jobs || jobsResp.data?.items || [];
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
            this.$router.push({ name: 'falara.translation.manager.job-detail', params: { id: jobId } });
        },
    },
});
