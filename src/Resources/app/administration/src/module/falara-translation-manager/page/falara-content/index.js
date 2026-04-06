const { Component } = Shopware;

Component.register('falara-content', {
    template: `
        <div class="falara-content">
            <falara-nav-tabs />

            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <mt-loader v-if="isLoading" />

                <div v-else>

                    <!-- Custom Tab Bar -->
                    <div :style="tabBarStyle">
                        <button
                            v-for="tab in tabItems"
                            :key="tab.name"
                            :style="activeTab === tab.name ? activeTabBtnStyle : tabBtnStyle"
                            @click="onTabChange(tab.name)"
                            @mouseenter="hoverTab = tab.name"
                            @mouseleave="hoverTab = null"
                        >
                            {{ tab.label }}
                        </button>
                    </div>

                    <!-- Snippet Group Filter -->
                    <!-- Snippet Group / Subgroup Filters -->
                    <div v-if="activeTab === 'snippet' && snippetGroups.length > 0" :style="{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }">
                        <div>
                            <label :style="{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }">
                                Snippet Group
                            </label>
                            <select
                                :value="selectedSnippetGroup"
                                @change="onSnippetGroupChange($event.target.value)"
                                :style="selectStyle"
                            >
                                <option value="">All groups ({{ snippetGroupTotal }})</option>
                                <option
                                    v-for="group in snippetGroups"
                                    :key="group.name"
                                    :value="group.name"
                                >
                                    {{ group.name }} ({{ group.snippetCount }})
                                </option>
                            </select>
                        </div>
                        <div v-if="selectedSnippetGroup && snippetSubgroups.length > 0">
                            <label :style="{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }">
                                Key Prefix
                            </label>
                            <select
                                :value="selectedSnippetSubgroup"
                                @change="onSnippetSubgroupChange($event.target.value)"
                                :style="selectStyle"
                            >
                                <option value="">All prefixes</option>
                                <option
                                    v-for="sub in snippetSubgroups"
                                    :key="sub.name"
                                    :value="sub.name"
                                >
                                    {{ sub.name }} ({{ sub.snippetCount }})
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Toolbar -->
                    <div :style="{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }">
                        <div :style="{ flex: 1 }">
                            <mt-text-field
                                :label="$t('falara-translation-manager.content.search')"
                                v-model="searchTerm"
                                @change="onSearch"
                            />
                        </div>
                        <mt-button
                            variant="primary"
                            :disabled="selectedItems.length === 0"
                            @click="openTranslateModal"
                        >
                            {{ $t('falara-translation-manager.content.translateSelected') }}
                            <span v-if="selectedItems.length > 0">&nbsp;({{ selectedItems.length }})</span>
                        </mt-button>
                    </div>

                    <!-- Table -->
                    <div :style="tableWrapStyle">
                        <table v-if="items.length > 0" :style="tableStyle">
                            <thead>
                                <tr>
                                    <th :style="{ ...thStyle, width: '40px' }">
                                        <mt-checkbox
                                            :checked="allSelected"
                                            @change="toggleAll"
                                        />
                                    </th>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.content.name') }}</th>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.content.type') }}</th>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.content.lastTranslated') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(item, idx) in items"
                                    :key="item.id"
                                    :style="idx % 2 === 0 ? tdRowEvenStyle : tdRowOddStyle"
                                >
                                    <td :style="tdStyle">
                                        <mt-checkbox
                                            :checked="selectedItems.includes(item.id)"
                                            @change="toggleItem(item.id)"
                                        />
                                    </td>
                                    <td :style="tdStyle">{{ item.name }}</td>
                                    <td :style="tdStyle">{{ item.type }}</td>
                                    <td :style="tdStyle">{{ item.lastTranslated ? formatDate(item.lastTranslated) : '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p v-else :style="{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }">
                            {{ $t('falara-translation-manager.general.noData') }}
                        </p>
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }">
                        <mt-button variant="ghost" :disabled="currentPage <= 1" @click="prevPage">«</mt-button>
                        <span :style="{ fontSize: '14px', color: '#374151', fontWeight: '500' }">{{ currentPage }} / {{ totalPages }}</span>
                        <mt-button variant="ghost" :disabled="currentPage >= totalPages" @click="nextPage">»</mt-button>
                    </div>

                </div>

                <!-- Translate Modal -->
                <div v-if="showTranslateModal" :style="modalOverlayStyle">
                    <div :style="modalStyle">
                        <mt-card :title="$t('falara-translation-manager.modal.title')">
                            <falara-translate-modal
                                :items="selectedItemObjects"
                                :sales-channel-id="salesChannelId"
                                :defaults="translationDefaults"
                                @translate="onTranslate"
                                @cancel="showTranslateModal = false"
                            />
                        </mt-card>
                    </div>
                </div>

            <!-- Success Modal (fixed position, outside content flow) -->
            <div v-if="showSuccessModal" :style="{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }">
                <div :style="{ background: '#fff', borderRadius: '16px', padding: '40px 48px', textAlign: 'center', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }">
                    <div :style="{ width: '64px', height: '64px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }">
                        <span :style="{ color: '#fff', fontSize: '32px', lineHeight: 1 }">&#x2714;</span>
                    </div>
                    <h2 :style="{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }">Translation Started</h2>
                    <p :style="{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.5' }">Your content has been sent to Falara for translation. You can track the progress on the Jobs page.</p>
                    <button @click="goToJobs" :style="{ background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }">View Jobs</button>
                </div>
            </div>
            </div>
        </div>
    `,

    data() {
        return {
            isLoading: false,
            activeTab: 'product',
            hoverTab: null,
            searchTerm: '',
            items: [],
            selectedItems: [],
            currentPage: 1,
            totalPages: 1,
            pageSize: 25,
            totalItems: 0,
            showTranslateModal: false,
            showSuccessModal: false,
            salesChannelId: null,
            translationDefaults: {},
            snippetGroups: [],
            selectedSnippetGroup: '',
            snippetSubgroups: [],
            selectedSnippetSubgroup: '',
        };
    },

    computed: {
        tabItems() {
            return [
                { name: 'product', label: this.$t('falara-translation-manager.content.product') },
                { name: 'category', label: this.$t('falara-translation-manager.content.category') },
                { name: 'cms_page', label: this.$t('falara-translation-manager.content.cms_page') },
                { name: 'snippet', label: this.$t('falara-translation-manager.content.snippet') },
            ];
        },

        allSelected() {
            return this.items.length > 0 && this.items.every(item => this.selectedItems.includes(item.id));
        },

        selectedItemObjects() {
            return this.items.filter(item => this.selectedItems.includes(item.id));
        },

        snippetGroupTotal() {
            return this.snippetGroups.reduce((sum, g) => sum + g.snippetCount, 0);
        },

        selectStyle() {
            return {
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px',
                fontSize: '14px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
            };
        },

        tabBarStyle() {
            return {
                display: 'flex',
                gap: '4px',
                marginBottom: '20px',
                background: '#f3f4f6',
                borderRadius: '8px',
                padding: '4px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        tabBtnStyle() {
            return {
                background: 'none',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 18px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'all 0.15s ease',
            };
        },

        activeTabBtnStyle() {
            return {
                ...this.tabBtnStyle,
                background: '#ffffff',
                color: '#1a73e8',
                fontWeight: '600',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            };
        },

        tableWrapStyle() {
            return {
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
            };
        },

        tableStyle() {
            return {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            };
        },

        thStyle() {
            return {
                textAlign: 'left',
                padding: '10px 16px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#f9fafb',
                borderBottom: '2px solid #e5e7eb',
            };
        },

        tdStyle() {
            return {
                padding: '12px 16px',
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

        modalOverlayStyle() {
            return {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '1000',
            };
        },

        modalStyle() {
            return {
                width: '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
            };
        },
    },

    created() {
        this.activeTab = this.$route.params.type || 'product';
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
                await this.loadDefaults();
                if (this.activeTab === 'snippet') {
                    await this.loadSnippetGroups();
                }
                await this.loadItems();
            }
        },

        async loadDefaults() {
            if (!this.salesChannelId) return;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getDefaults(this.salesChannelId);
                this.translationDefaults = resp.data || {};
            } catch (e) {
                this.translationDefaults = {};
            }
        },

        async loadSnippetGroups() {
            if (!this.salesChannelId) return;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getSnippetGroups(this.salesChannelId);
                this.snippetGroups = resp.data?.groups || [];
            } catch (e) {
                this.snippetGroups = [];
            }
        },

        async loadSnippetSubgroups() {
            if (!this.salesChannelId || !this.selectedSnippetGroup) return;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getSnippetSubgroups(this.salesChannelId, this.selectedSnippetGroup);
                this.snippetSubgroups = resp.data?.subgroups || [];
            } catch (e) {
                this.snippetSubgroups = [];
            }
        },

        async loadItems() {
            if (!this.salesChannelId) return;
            this.isLoading = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const params = {
                    page: this.currentPage,
                    limit: this.pageSize,
                    search: this.searchTerm,
                };

                // Pass group / subgroup filters for snippets
                if (this.activeTab === 'snippet' && this.selectedSnippetGroup) {
                    params.group = this.selectedSnippetGroup;
                    if (this.selectedSnippetSubgroup) {
                        params.subgroup = this.selectedSnippetSubgroup;
                    }
                }

                const resp = await falaraApiService.getContentItems(this.salesChannelId, this.activeTab, params);
                this.items = resp.data?.items || [];
                this.totalItems = resp.data?.total || 0;
                this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
            } catch (e) {
                this.items = [];
            } finally {
                this.isLoading = false;
            }
        },

        onTabChange(tabName) {
            if (this.activeTab === tabName) return;
            this.activeTab = tabName;
            this.selectedItems = [];
            this.currentPage = 1;
            this.selectedSnippetGroup = '';
            this.snippetGroups = [];
            this.selectedSnippetSubgroup = '';
            this.snippetSubgroups = [];
            this.$router.replace({ params: { type: this.activeTab } });

            if (tabName === 'snippet') {
                this.loadSnippetGroups().then(() => this.loadItems());
            } else {
                this.loadItems();
            }
        },

        onSnippetGroupChange(value) {
            this.selectedSnippetGroup = value;
            this.selectedSnippetSubgroup = "";
            this.snippetSubgroups = [];
            this.currentPage = 1;
            this.selectedItems = [];
            if (value) {
                this.loadSnippetSubgroups().then(() => this.loadItems());
            } else {
                this.loadItems();
            }
        },

        onSnippetSubgroupChange(value) {
            this.selectedSnippetSubgroup = value;
            this.currentPage = 1;
            this.selectedItems = [];
            this.loadItems();
        },

        onSearch() {
            this.currentPage = 1;
            this.loadItems();
        },

        toggleItem(id) {
            const idx = this.selectedItems.indexOf(id);
            if (idx > -1) {
                this.selectedItems.splice(idx, 1);
            } else {
                this.selectedItems.push(id);
            }
        },

        toggleAll() {
            if (this.allSelected) {
                this.selectedItems = [];
            } else {
                this.selectedItems = this.items.map(item => item.id);
            }
        },

        openTranslateModal() {
            if (this.selectedItems.length === 0) return;
            this.showTranslateModal = true;
        },

        goToJobs() {
            this.showSuccessModal = false;
            this.$router.push({ name: 'falara.translation.manager.jobs' });
        },

        async onTranslate(data) {
            this.showTranslateModal = false;
            this.isLoading = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const payload = {
                    salesChannelId: this.salesChannelId,
                    resourceType: this.activeTab,
                    entityIds: data.items.map(i => i.id),
                    sourceLocale: Shopware.Context.api.systemLanguageId,
                    targetLocales: data.targetLanguages,
                    sourceLang: 'en',
                    options: {
                        quality: data.quality || 'standard',
                        domain: data.domain || undefined,
                        tone: data.tone || undefined,
                        instructions: data.instructions || undefined,
                        glossary_ids: data.glossaryId ? [data.glossaryId] : undefined,
                    },
                };
                await falaraApiService.translate(payload);
                this.selectedItems = [];
                this.isLoading = false;
                this.showSuccessModal = true;
            } catch (e) {
                this.isLoading = false;
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            }
        },

        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadItems();
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadItems();
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString();
        },
    },
});
