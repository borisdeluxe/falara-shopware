const { Component } = Shopware;

Component.register('falara-audit', {
    template: `
        <div class="falara-audit">
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <mt-card :title="$t('falara-translation-manager.audit.title')">
                    <p :style="{ marginBottom: '16px', color: '#6b7280' }">{{ $t('falara-translation-manager.audit.description') }}</p>

                    <mt-button
                        variant="primary"
                        :disabled="isScanning"
                        @click="runScan"
                    >
                        {{ isScanning ? $t('falara-translation-manager.audit.scanning') : $t('falara-translation-manager.audit.runScan') }}
                    </mt-button>

                    <mt-loader v-if="isScanning" :style="{ marginTop: '24px' }" />

                    <div v-else-if="results && results.coverage" :style="{ marginTop: '24px' }">

                        <div :style="summaryRowStyle">
                            <div :style="summaryCardStyle">
                                <div :style="summaryLabelStyle">{{ $t('falara-translation-manager.audit.totalWords') }}</div>
                                <div :style="summaryNumberStyle">{{ totalWords.toLocaleString() }}</div>
                            </div>
                            <div :style="summaryCardStyle">
                                <div :style="summaryLabelStyle">{{ $t('falara-translation-manager.audit.totalItems') }}</div>
                                <div :style="summaryNumberStyle">{{ totalItems.toLocaleString() }}</div>
                            </div>
                        </div>

                        <table :style="tableStyle">
                            <thead>
                                <tr>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.audit.contentType') }}</th>
                                    <th :style="thStyleRight">{{ $t('falara-translation-manager.audit.items') }}</th>
                                    <th :style="thStyleRight">{{ $t('falara-translation-manager.audit.words') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in results.coverage" :key="row.type" :style="trStyle">
                                    <td :style="tdStyle">{{ row.label }}</td>
                                    <td :style="tdStyleRight">{{ row.totalItems.toLocaleString() }}</td>
                                    <td :style="tdStyleRight">{{ row.sourceWordCount.toLocaleString() }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-else-if="!isScanning" :style="{ marginTop: '24px', color: '#9ca3af' }">
                        <p>{{ $t('falara-translation-manager.audit.noResults') }}</p>
                    </div>
                </mt-card>
            </div>
        </div>
    `,

    data() {
        return {
            isScanning: false,
            results: null,
            salesChannelId: null,
        };
    },

    computed: {
        totalWords() {
            if (!this.results?.coverage) return 0;
            return this.results.coverage.reduce((sum, c) => sum + (c.sourceWordCount || 0), 0);
        },
        totalItems() {
            if (!this.results?.coverage) return 0;
            return this.results.coverage.reduce((sum, c) => sum + (c.totalItems || 0), 0);
        },
        summaryRowStyle() {
            return {
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
            };
        },
        summaryCardStyle() {
            return {
                flex: '1',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px 24px',
            };
        },
        summaryLabelStyle() {
            return {
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            };
        },
        summaryNumberStyle() {
            return {
                fontSize: '28px',
                fontWeight: '700',
                color: '#111827',
            };
        },
        tableStyle() {
            return {
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
            };
        },
        thStyle() {
            return {
                background: '#f9fafb',
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
            };
        },
        thStyleRight() {
            return {
                background: '#f9fafb',
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
            };
        },
        trStyle() {
            return {
                borderBottom: '1px solid #f3f4f6',
            };
        },
        tdStyle() {
            return {
                padding: '12px 16px',
                fontSize: '14px',
                color: '#374151',
            };
        },
        tdStyleRight() {
            return {
                padding: '12px 16px',
                fontSize: '14px',
                color: '#374151',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
            };
        },
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
    },
});
