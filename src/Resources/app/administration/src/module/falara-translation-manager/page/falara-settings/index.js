const { Component } = Shopware;

Component.register('falara-settings', {
    template: `
        <div>
            <falara-nav-tabs />

            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <mt-loader v-if="isLoading" />

                <div v-else>
                    <!-- Sub-tab bar -->
                    <div :style="subTabBarStyle">
                        <button
                            v-for="tab in subTabs"
                            :key="tab.key"
                            :style="activeTab === tab.key ? activeSubTabStyle : subTabStyle"
                            @click="activeTab = tab.key"
                            @mouseenter="onSubTabHover($event, tab.key)"
                            @mouseleave="onSubTabLeave($event, tab.key)"
                        >
                            {{ tab.label }}
                        </button>
                    </div>

                    <!-- CONNECTION TAB -->
                    <div v-show="activeTab === 'connection'">

                        <!-- NOT connected -->
                        <div v-if="!isConnected" :style="cardStyle">
                            <h2 :style="cardTitleStyle">Connect to Falara</h2>

                            <div :style="fieldWrapStyle">
                                <mt-text-field
                                    label="API Key"
                                    placeholder="Enter your Falara API key"
                                    v-model="connectForm.apiKey"
                                    type="password"
                                />
                            </div>

                            <div :style="fieldWrapStyle">
                                <mt-button
                                    variant="primary"
                                    :disabled="!connectForm.apiKey || isConnecting"
                                    @click="connect"
                                >
                                    {{ isConnecting ? 'Connecting…' : 'Connect' }}
                                </mt-button>
                            </div>

                            <p :style="linkTextStyle">
                                Don't have an account?
                                <a href="https://app.falara.io" target="_blank" :style="linkAStyle">Visit app.falara.io</a>
                            </p>
                        </div>

                        <!-- CONNECTED -->
                        <div v-else :style="cardStyle">
                            <div :style="statusRowStyle">
                                <span :style="statusDotStyle"></span>
                                <span :style="connectedLabelStyle">Connected</span>
                            </div>

                            <div :style="metaBlockStyle">
                                <div v-if="connectionData.accountName" :style="metaLineStyle">
                                    <span :style="metaKeyStyle">Name:</span>
                                    <span :style="metaValStyle">{{ connectionData.accountName }}</span>
                                </div>
                                <div v-if="connectionData.accountId" :style="metaLineStyle">
                                    <span :style="metaKeyStyle">Account ID:</span>
                                    <span :style="metaValStyle">{{ connectionData.accountId }}</span>
                                </div>
                                <div v-if="connectionData.plan" :style="metaLineStyle">
                                    <span :style="metaKeyStyle">Plan:</span>
                                    <span :style="metaValStyle">{{ connectionData.plan }}</span>
                                </div>
                                <div v-if="connectionData.connectedAt" :style="metaLineStyle">
                                    <span :style="metaKeyStyle">Connected since:</span>
                                    <span :style="metaValStyle">{{ formatDate(connectionData.connectedAt) }}</span>
                                </div>
                            </div>

                            <div v-if="!showDisconnectConfirm" :style="{ marginTop: '16px' }">
                                <mt-button
                                    variant="danger"
                                    size="small"
                                    :disabled="isDisconnecting"
                                    @click="showDisconnectConfirm = true"
                                >
                                    {{ isDisconnecting ? 'Disconnecting…' : 'Disconnect' }}
                                </mt-button>
                            </div>

                            <div v-else :style="confirmBoxStyle">
                                <p :style="confirmTextStyle">Are you sure? This will cancel all pending jobs.</p>
                                <div :style="confirmBtnRowStyle">
                                    <mt-button variant="danger" size="small" @click="disconnect">Yes</mt-button>
                                    <mt-button variant="ghost" size="small" @click="showDisconnectConfirm = false">No</mt-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CUSTOM FIELDS TAB -->
                    <div v-show="activeTab === 'customFields'">
                        <div :style="{ ...cardStyle, maxWidth: '720px' }">
                            <h2 :style="cardTitleStyle">Custom Fields Whitelist</h2>

                            <div :style="{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '13px', lineHeight: '1.5', color: '#166534' }">
                                <strong>What are Custom Fields?</strong><br>
                                Custom Fields are additional translatable fields added to products by plugins or your own configuration (e.g. "Material", "Care Instructions", "USP Headline").
                                Check the fields below to include them in translations. Only <strong>text</strong>, <strong>html</strong>, and <strong>textarea</strong> fields can be translated.
                            </div>

                            <div v-if="isLoadingAvailableFields" :style="{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }">
                                Loading custom fields…
                            </div>

                            <div v-else-if="availableFieldSets.length === 0" :style="{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }">
                                No custom field sets found in your Shopware installation.
                            </div>

                            <div v-else>
                                <div
                                    v-for="set in availableFieldSets"
                                    :key="set.name"
                                    :style="{ marginBottom: '20px' }"
                                >
                                    <div :style="{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }">
                                        {{ set.label }}
                                        <span v-if="set.entity" :style="{ fontSize: '11px', fontWeight: '400', color: '#9ca3af', textTransform: 'none', letterSpacing: '0' }">{{ set.entity }}</span>
                                    </div>
                                    <div
                                        v-for="field in set.fields"
                                        :key="field.name"
                                        :style="{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 4px', borderRadius: '4px', opacity: field.translatable ? 1 : 0.45 }"
                                    >
                                        <input
                                            type="checkbox"
                                            :id="'cf-' + field.name"
                                            :checked="isFieldWhitelisted(field.name)"
                                            :disabled="!field.translatable"
                                            @change="toggleField(field, set, $event)"
                                            :style="{ width: '16px', height: '16px', cursor: field.translatable ? 'pointer' : 'not-allowed', flexShrink: 0 }"
                                        />
                                        <label
                                            :for="'cf-' + field.name"
                                            :style="{ fontSize: '14px', color: field.translatable ? '#1a1a2e' : '#9ca3af', cursor: field.translatable ? 'pointer' : 'default', flex: 1 }"
                                        >
                                            {{ field.label }}
                                            <span :style="{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px' }">{{ field.name }}</span>
                                            <span v-if="!field.translatable" :style="{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px', fontStyle: 'italic' }">— not translatable</span>
                                        </label>
                                        <span :style="{ fontSize: '11px', color: '#d1d5db', background: '#f3f4f6', borderRadius: '4px', padding: '1px 6px', flexShrink: 0 }">{{ field.type }}</span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="saveMessage" :style="{ padding: '10px 16px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', background: saveMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', color: saveMessage.type === 'success' ? '#166534' : '#991b1b', border: saveMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca' }">{{ saveMessage.text }}</div>
                            <mt-button variant="primary" @click="saveCustomFields" :disabled="isSaving || isLoadingAvailableFields" :style="{ marginTop: '8px' }">
                                {{ isSaving ? 'Saving…' : 'Save' }}
                            </mt-button>
                        </div>
                    </div>

                    <!-- DEFAULTS TAB -->
                    <div v-show="activeTab === 'defaults'">
                        <div :style="cardStyle">
                            <h2 :style="cardTitleStyle">Translation Defaults</h2>

                            <div :style="fieldWrapStyle">
                                <mt-text-field
                                    label="Source Language"
                                    v-model="defaults.sourceLanguage"
                                />
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Domain</label>
                                <select v-model="defaults.domain" :style="nativeSelectStyle">
                                    <option value="">None</option>
                                    <option value="e-commerce">E-Commerce</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="legal">Legal</option>
                                    <option value="medical">Medical</option>
                                    <option value="technical">Technical</option>
                                    <option value="software">Software</option>
                                </select>
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Tone</label>
                                <select v-model="defaults.tone" :style="nativeSelectStyle">
                                    <option value="">None</option>
                                    <option value="formal">Formal</option>
                                    <option value="casual">Casual</option>
                                    <option value="technical">Technical</option>
                                </select>
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Quality</label>
                                <select v-model="defaults.quality" :style="nativeSelectStyle">
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Provider</label>
                                <select v-model="defaults.provider" :style="nativeSelectStyle">
                                    <option value="">— Select provider —</option>
                                    <option v-for="opt in providerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>

                            <!-- QA Info Box -->
                            <div :style="qaBoxStyle">
                                <div :style="qaIconWrapStyle">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="10" fill="#3b82f6"/>
                                        <path d="M6 10.5L8.5 13L14 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div :style="qaTextWrapStyle">
                                    <div :style="qaTitleStyle">{{ qaTitle }}</div>
                                    <div :style="qaDescStyle">{{ qaDescription }}</div>
                                </div>
                            </div>

                            <div :style="fieldWrapStyle">
                                <mt-textarea
                                    label="Instructions"
                                    v-model="defaults.instructions"
                                />
                            </div>

                            <mt-button variant="primary" @click="saveDefaults" :disabled="isSaving">
                                {{ isSaving ? 'Saving…' : 'Save Defaults' }}
                            </mt-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            isLoading: true,
            isSaving: false,
            saveMessage: null,
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
            availableFieldSets: [],
            isLoadingAvailableFields: false,
            whitelistedFields: [],
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
        isGerman() {
            const locale = Shopware.State.get('session')?.currentLocale || '';
            return locale.startsWith('de');
        },

        qaTitle() {
            return this.isGerman
                ? 'Automatische Qualitätssicherung'
                : 'Automated Quality Assurance';
        },

        qaDescription() {
            return this.isGerman
                ? 'Mehrere automatisierte QA-Agenten prüfen jede Übersetzung auf Qualität — unabhängig von der gewählten Engine. Nur bei falara.io.'
                : 'Multiple automated QA agents will review every translation for quality assurance, regardless of engine. Only at falara.io.';
        },

        qaBoxStyle() {
            return {
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
            };
        },

        qaIconWrapStyle() {
            return {
                flexShrink: '0',
                marginTop: '1px',
            };
        },

        qaTextWrapStyle() {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            };
        },

        qaTitleStyle() {
            return {
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e40af',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        qaDescStyle() {
            return {
                fontSize: '13px',
                color: '#3b82f6',
                lineHeight: '1.5',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        nativeSelectLabelStyle() {
            return {
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        nativeSelectStyle() {
            return {
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#374151',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                appearance: 'auto',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        subTabs() {
            return [
                { key: 'connection', label: 'Connection' },
                { key: 'customFields', label: 'Custom Fields' },
                { key: 'defaults', label: 'Defaults' },
            ];
        },

        qualityOptions() {
            return [
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

        /* ---------- Style helpers ---------- */

        subTabBarStyle() {
            return {
                display: 'flex',
                gap: '0',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '24px',
                background: '#fff',
            };
        },

        subTabStyle() {
            return {
                background: 'none',
                border: 'none',
                borderBottom: '3px solid transparent',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                whiteSpace: 'nowrap',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'all 0.15s ease',
            };
        },

        activeSubTabStyle() {
            return {
                ...this.subTabStyle,
                color: '#1a73e8',
                borderBottomColor: '#1a73e8',
                fontWeight: '600',
            };
        },

        cardStyle() {
            return {
                background: '#fff',
                borderRadius: '10px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                maxWidth: '560px',
            };
        },

        cardTitleStyle() {
            return {
                fontSize: '18px',
                fontWeight: '700',
                color: '#1a1a2e',
                margin: '0 0 20px 0',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        fieldWrapStyle() {
            return { marginBottom: '16px' };
        },

        linkTextStyle() {
            return {
                marginTop: '16px',
                fontSize: '13px',
                color: '#6b7280',
            };
        },

        linkAStyle() {
            return {
                color: '#1a73e8',
                textDecoration: 'underline',
            };
        },

        statusRowStyle() {
            return {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
            };
        },

        statusDotStyle() {
            return {
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                marginRight: '8px',
                flexShrink: '0',
            };
        },

        connectedLabelStyle() {
            return {
                color: '#16a34a',
                fontWeight: '600',
                fontSize: '15px',
            };
        },

        metaBlockStyle() {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            };
        },

        metaLineStyle() {
            return {
                display: 'flex',
                gap: '8px',
                fontSize: '14px',
            };
        },

        metaKeyStyle() {
            return {
                color: '#6b7280',
                minWidth: '130px',
            };
        },

        metaValStyle() {
            return {
                color: '#1a1a2e',
                fontWeight: '500',
            };
        },

        confirmBoxStyle() {
            return {
                marginTop: '16px',
                padding: '16px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
            };
        },

        confirmTextStyle() {
            return {
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#dc2626',
                fontWeight: '500',
            };
        },

        confirmBtnRowStyle() {
            return {
                display: 'flex',
                gap: '8px',
            };
        },

        descStyle() {
            return {
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '20px',
                marginTop: '-12px',
            };
        },

        emptyTextStyle() {
            return {
                fontSize: '14px',
                color: '#9ca3af',
                fontStyle: 'italic',
                marginBottom: '16px',
            };
        },

        fieldListStyle() {
            return {
                listStyle: 'none',
                padding: '0',
                margin: '0 0 20px 0',
            };
        },

        fieldItemStyle() {
            return {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px',
                color: '#374151',
            };
        },
    },

    created() {
        this.initSalesChannel();
    },

    methods: {
        onSubTabHover(event, key) {
            if (this.activeTab !== key) {
                event.target.style.color = '#1a73e8';
                event.target.style.background = '#f0f4ff';
            }
        },

        onSubTabLeave(event, key) {
            if (this.activeTab !== key) {
                event.target.style.color = '#6b7280';
                event.target.style.background = 'none';
            }
        },

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
                const conn = resp.data && resp.data.connection;
                this.isConnected = !!(conn && !conn.disconnectedAt);
                if (this.isConnected) {
                    this.connectionData = {
                        accountId: conn.falaraAccountId,
                        accountName: conn.accountName || null,
                        plan: conn.plan || null,
                        connectedAt: conn.connectedAt || null,
                    };
                } else {
                    this.connectionData = {};
                }
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
                const entries = resp.data && resp.data.customFields ? resp.data.customFields : [];
                // Store whitelist entries with id for deletion
                this.customFieldEntries = entries;
                // Build flat set of whitelisted field names for checkbox state
                this.whitelistedFields = entries.map(e => e.fieldName);
            } catch (e) {
                this.customFieldEntries = [];
                this.whitelistedFields = [];
            }
            // Also load available fields from Shopware
            await this.loadAvailableCustomFields();
        },

        async loadAvailableCustomFields() {
            this.isLoadingAvailableFields = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getAvailableCustomFields(this.salesChannelId);
                this.availableFieldSets = resp.data && resp.data.sets ? resp.data.sets : [];
            } catch (e) {
                this.availableFieldSets = [];
            } finally {
                this.isLoadingAvailableFields = false;
            }
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
                    message: 'Connected successfully.',
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: 'Connection failed. Please check your API key.',
                });
            } finally {
                this.isConnecting = false;
            }
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
                    message: 'Disconnected successfully.',
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: 'Disconnect failed. Please try again.',
                });
            } finally {
                this.isDisconnecting = false;
            }
        },

        isFieldWhitelisted(fieldName) {
            return this.whitelistedFields.includes(fieldName);
        },

        toggleField(field, set, event) {
            if (event.target.checked) {
                if (!this.whitelistedFields.includes(field.name)) {
                    this.whitelistedFields.push(field.name);
                    this.pendingAdditions = this.pendingAdditions || [];
                    this.pendingAdditions.push({ fieldSetName: set.name, fieldName: field.name });
                }
            } else {
                const idx = this.whitelistedFields.indexOf(field.name);
                if (idx !== -1) {
                    this.whitelistedFields.splice(idx, 1);
                    this.pendingRemovals = this.pendingRemovals || [];
                    this.pendingRemovals.push(field.name);
                }
            }
        },

        async saveCustomFields() {
            this.isSaving = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');

                // Determine current state by comparing whitelistedFields with stored entries
                const storedFieldNames = (this.customFieldEntries || []).map(e => e.fieldName);

                // Fields to add: in whitelistedFields but not in stored entries
                const toAdd = this.whitelistedFields.filter(name => !storedFieldNames.includes(name));

                // Fields to remove: in stored entries but not in whitelistedFields
                const toRemove = (this.customFieldEntries || []).filter(e => !this.whitelistedFields.includes(e.fieldName));

                // Find set name for each field to add
                const addPromises = toAdd.map(fieldName => {
                    let setName = '';
                    for (const set of this.availableFieldSets) {
                        const found = set.fields.find(f => f.name === fieldName);
                        if (found) { setName = set.name; break; }
                    }
                    return falaraApiService.addCustomField(this.salesChannelId, setName, fieldName);
                });

                const removePromises = toRemove.map(entry => falaraApiService.deleteCustomField(entry.id));

                await Promise.all([...addPromises, ...removePromises]);

                // Reload to sync state
                await this.loadCustomFields();
                this.saveMessage = { type: 'success', text: 'Custom fields saved successfully.' };
                setTimeout(() => { this.saveMessage = null; }, 4000);
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: 'Failed to save custom fields.',
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
                    message: 'Defaults saved.',
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: 'Failed to save defaults.',
                });
            } finally {
                this.isSaving = false;
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            } catch (e) {
                return dateStr;
            }
        },
    },
});
