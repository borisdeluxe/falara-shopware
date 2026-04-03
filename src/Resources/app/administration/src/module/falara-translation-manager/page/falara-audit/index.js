const { Component } = Shopware;

Component.register('falara-audit', {
    template: `
        <div class="falara-audit">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.audit.title')">
                <p class="falara-audit__description">{{ $t('falara-translation-manager.audit.description') }}</p>

                <mt-button
                    variant="primary"
                    :disabled="isScanning"
                    @click="runScan"
                    class="falara-audit__scan-btn"
                >
                    {{ isScanning ? $t('falara-translation-manager.audit.scanning') : $t('falara-translation-manager.audit.runScan') }}
                </mt-button>

                <mt-loader v-if="isScanning" />

                <div v-else-if="results" class="falara-audit__results">
                    <h3>{{ $t('falara-translation-manager.audit.results') }}</h3>

                    <div v-if="results.recommendation" class="falara-audit__recommendation">
                        {{ $t('falara-translation-manager.audit.planRecommendation', { plan: results.recommendation }) }}
                    </div>

                    <div class="falara-audit__breakdown">
                        <div v-for="(langData, langCode) in results.byLanguage" :key="langCode" class="falara-audit__language-section">
                            <h4>{{ langCode }}</h4>
                            <table class="falara-audit__table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('falara-translation-manager.audit.type') }}</th>
                                        <th>{{ $t('falara-translation-manager.audit.total') }}</th>
                                        <th>{{ $t('falara-translation-manager.audit.missing') }}</th>
                                        <th>{{ $t('falara-translation-manager.audit.coverage') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(typeData, typeName) in langData" :key="typeName">
                                        <td>{{ typeName }}</td>
                                        <td>{{ typeData.total }}</td>
                                        <td>{{ typeData.missing }}</td>
                                        <td>{{ coveragePercent(typeData) }}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-else class="falara-audit__empty">
                    <p>{{ $t('falara-translation-manager.audit.noResults') }}</p>
                </div>
            </mt-card>
        </div>
    `,

    data() {
        return {
            isScanning: false,
            results: null,
            salesChannelId: null,
        };
    },

    created() {
        this.initSalesChannel();
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
            }
        },

        async runScan() {
            if (!this.salesChannelId) return;
            this.isScanning = true;
            this.results = null;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.runAudit(this.salesChannelId);
                this.results = resp.data || {};
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            } finally {
                this.isScanning = false;
            }
        },

        coveragePercent(typeData) {
            if (!typeData.total || typeData.total === 0) return 100;
            const translated = typeData.total - (typeData.missing || 0);
            return Math.round((translated / typeData.total) * 100);
        },
    },
});
