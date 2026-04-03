const { Component } = Shopware;

Component.register('falara-settings', {
    template: `
        <div class="falara-settings">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.settings.title')">
                <mt-tabs
                    :items="tabItems"
                    v-model="activeTab"
                    @change="onTabChange"
                />

                <mt-loader v-if="isLoading" />

                <div v-else>
                    <!-- Connection Tab -->
                    <div v-show="activeTab === 'connection'" class="falara-settings__tab-content">
                        <h3>{{ $t('falara-translation-manager.settings.connection.title') }}</h3>

                        <div class="falara-settings__status">
                            <span class="falara-settings__status-label">{{ $t('falara-translation-manager.settings.connection.status') }}:</span>
                            <span v-if="isConnected" class="falara-settings__status--connected">
                                {{ $t('falara-translation-manager.settings.connection.connected') }}
                                <span v-if="connectionData.account"> — {{ $t('falara-translation-manager.settings.connection.connectedAs', { account: connectionData.account }) }}</span>
                            </span>
                            <span v-else class="falara-settings__status--disconnected">
                                {{ $t('falara-translation-manager.settings.connection.notConnected') }}
                            </span>
                        </div>

                        <div v-if="!isConnected" class="falara-settings__connect-form">
                            <mt-text-field
                                :label="$t('falara-translation-manager.settings.connection.apiKey')"
                                :placeholder="$t('falara-translation-manager.settings.connection.apiKeyPlaceholder')"
                                v-model="connectForm.apiKey"
                                type="password"
                            />
                            <mt-button
                                variant="primary"
                                :disabled="!connectForm.apiKey || isConnecting"
                                @click="connect"
                            >
                                {{ isConnecting ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.settings.connection.connect') }}
                            </mt-button>
                        </div>

                        <div v-else class="falara-settings__disconnect">
                            <mt-button
                                variant="danger"
                                :disabled="isDisconnecting"
                                @click="confirmDisconnect"
                            >
                                {{ isDisconnecting ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.settings.connection.disconnect') }}
                            </mt-button>
                        </div>

                        <div v-if="showDisconnectConfirm" class="falara-settings__confirm-dialog">
                            <p>{{ $t('falara-translation-manager.settings.connection.disconnectConfirm') }}</p>
                            <mt-button variant="danger" @click="disconnect">{{ $t('falara-translation-manager.general.yes') }}</mt-button>
                            <mt-button variant="ghost" @click="showDisconnectConfirm = false">{{ $t('falara-translation-manager.general.no') }}</mt-button>
                        </div>
                    </div>

                    <!-- Custom Fields Tab -->
                    <div v-show="activeTab === 'customFields'" class="falara-settings__tab-content">
                        <h3>{{ $t('falara-translation-manager.settings.customFields.title') }}</h3>
                        <p>{{ $t('falara-translation-manager.settings.customFields.description') }}</p>

                        <div class="falara-settings__custom-fields-form">
                            <mt-text-field
                                :label="$t('falara-translation-manager.settings.customFields.fieldName')"
                                v-model="newFieldName"
                            />
                            <mt-button variant="primary" @click="addCustomField" :disabled="!newFieldName">
                                {{ $t('falara-translation-manager.settings.customFields.addField') }}
                            </mt-button>
                        </div>

                        <div v-if="customFields.length === 0" class="falara-settings__empty">
                            <p>{{ $t('falara-translation-manager.settings.customFields.noFields') }}</p>
                        </div>
                        <ul v-else class="falara-settings__custom-fields-list">
                            <li v-for="(field, idx) in customFields" :key="idx" class="falara-settings__custom-field-item">
                                <span>{{ field }}</span>
                                <mt-button variant="ghost" size="small" @click="removeCustomField(idx)">
                                    {{ $t('falara-translation-manager.settings.customFields.removeField') }}
                                </mt-button>
                            </li>
                        </ul>

                        <mt-button variant="primary" @click="saveCustomFields" :disabled="isSaving">
                            {{ isSaving ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.general.save') }}
                        </mt-button>
                    </div>

                    <!-- Defaults Tab -->
                    <div v-show="activeTab === 'defaults'" class="falara-settings__tab-content">
                        <h3>{{ $t('falara-translation-manager.settings.defaults.title') }}</h3>

                        <mt-text-field
                            :label="$t('falara-translation-manager.settings.defaults.sourceLanguage')"
                            v-model="defaults.sourceLanguage"
                        />

                        <mt-text-field
                            :label="$t('falara-translation-manager.settings.defaults.domain')"
                            v-model="defaults.domain"
                        />

                        <mt-text-field
                            :label="$t('falara-translation-manager.settings.defaults.tone')"
                            v-model="defaults.tone"
                        />

                        <mt-select
                            :label="$t('falara-translation-manager.settings.defaults.quality')"
                            v-model="defaults.quality"
                            :options="qualityOptions"
                        />

                        <mt-select
                            :label="$t('falara-translation-manager.settings.defaults.provider')"
                            v-model="defaults.provider"
                            :options="providerOptions"
                        />

                        <mt-textarea
                            :label="$t('falara-translation-manager.settings.defaults.instructions')"
                            v-model="defaults.instructions"
                        />

                        <mt-button variant="primary" @click="saveDefaults" :disabled="isSaving">
                            {{ isSaving ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.settings.defaults.save') }}
                        </mt-button>
                    </div>
                </div>
            </mt-card>
        </div>
    `,

    data() {
        return {
            isLoading: true,
            isSaving: false,
            isConnecting: false,
            isDisconnecting: false,
            activeTab: 'connection',
            isConnected: false,
            connectionData: {},
            showDisconnectConfirm: false,
            connectForm: {
                apiKey: '',
            },
            customFields: [],
            newFieldName: '',
            defaults: {
                sourceLanguage: '',
                domain: '',
                tone: '',
                quality: 'standard',
                provider: '',
                instructions: '',
            },
            salesChannelId: null,
        };
    },

    computed: {
        tabItems() {
            return [
                { name: 'connection', label: this.$t('falara-translation-manager.settings.tabs.connection') },
                { name: 'customFields', label: this.$t('falara-translation-manager.settings.tabs.customFields') },
                { name: 'defaults', label: this.$t('falara-translation-manager.settings.tabs.defaults') },
            ];
        },

        qualityOptions() {
            return [
                { value: 'draft', label: 'Draft' },
                { value: 'standard', label: 'Standard' },
                { value: 'premium', label: 'Premium' },
            ];
        },

        providerOptions() {
            return [
                { value: 'deepl', label: 'DeepL' },
                { value: 'claude', label: 'Claude' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'chatgpt', label: 'ChatGPT' },
            ];
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
                await this.loadAll();
            } else {
                this.isLoading = false;
            }
        },

        async loadAll() {
            this.isLoading = true;
            try {
                await Promise.all([
                    this.loadConnection(),
                    this.loadDefaults(),
                    this.loadCustomFields(),
                ]);
            } finally {
                this.isLoading = false;
            }
        },

        async loadConnection() {
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getConnection(this.salesChannelId);
                this.connectionData = resp.data || {};
                this.isConnected = !!(resp.data && resp.data.connected);
            } catch (e) {
                this.isConnected = false;
                this.connectionData = {};
            }
        },

        async loadDefaults() {
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getDefaults(this.salesChannelId);
                if (resp.data) {
                    this.defaults = { ...this.defaults, ...resp.data };
                }
            } catch (e) {
                // keep defaults
            }
        },

        async loadCustomFields() {
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getCustomFields(this.salesChannelId);
                this.customFields = resp.data?.fields || [];
            } catch (e) {
                this.customFields = [];
            }
        },

        onTabChange(tab) {
            this.activeTab = typeof tab === 'object' ? tab.name : tab;
        },

        async connect() {
            this.isConnecting = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.connect(this.salesChannelId, this.connectForm.apiKey);
                this.connectForm.apiKey = '';
                await this.loadConnection();
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'success',
                    message: this.$t('falara-translation-manager.general.success'),
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            } finally {
                this.isConnecting = false;
            }
        },

        confirmDisconnect() {
            this.showDisconnectConfirm = true;
        },

        async disconnect() {
            this.showDisconnectConfirm = false;
            this.isDisconnecting = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.disconnect(this.salesChannelId);
                await this.loadConnection();
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'success',
                    message: this.$t('falara-translation-manager.general.success'),
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            } finally {
                this.isDisconnecting = false;
            }
        },

        addCustomField() {
            if (!this.newFieldName) return;
            if (!this.customFields.includes(this.newFieldName)) {
                this.customFields.push(this.newFieldName);
            }
            this.newFieldName = '';
        },

        removeCustomField(idx) {
            this.customFields.splice(idx, 1);
        },

        async saveCustomFields() {
            this.isSaving = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.saveCustomFields(this.salesChannelId, this.customFields);
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'success',
                    message: this.$t('falara-translation-manager.general.success'),
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            } finally {
                this.isSaving = false;
            }
        },

        async saveDefaults() {
            this.isSaving = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.saveDefaults(this.salesChannelId, this.defaults);
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'success',
                    message: this.$t('falara-translation-manager.general.success'),
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            } finally {
                this.isSaving = false;
            }
        },
    },
});
