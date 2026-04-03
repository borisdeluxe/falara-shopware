const { Component } = Shopware;

Component.register('falara-content', {
    template: `
        <div class="falara-content">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.content.title')">
                <mt-loader v-if="isLoading" />
                <div v-else>
                    <mt-tabs
                        :items="tabItems"
                        v-model="activeTab"
                        @change="onTabChange"
                    />

                    <div class="falara-content__toolbar">
                        <mt-text-field
                            :label="$t('falara-translation-manager.content.search')"
                            v-model="searchTerm"
                            @change="onSearch"
                        />
                        <mt-button
                            variant="primary"
                            :disabled="selectedItems.length === 0"
                            @click="openTranslateModal"
                        >
                            {{ $t('falara-translation-manager.content.translateSelected') }}
                            <span v-if="selectedItems.length > 0">({{ selectedItems.length }})</span>
                        </mt-button>
                    </div>

                    <table class="falara-content__table" v-if="items.length > 0">
                        <thead>
                            <tr>
                                <th>
                                    <mt-checkbox
                                        :checked="allSelected"
                                        @change="toggleAll"
                                    />
                                </th>
                                <th>{{ $t('falara-translation-manager.content.name') }}</th>
                                <th>{{ $t('falara-translation-manager.content.type') }}</th>
                                <th>{{ $t('falara-translation-manager.content.lastTranslated') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in items" :key="item.id">
                                <td>
                                    <mt-checkbox
                                        :checked="selectedItems.includes(item.id)"
                                        @change="toggleItem(item.id)"
                                    />
                                </td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.type }}</td>
                                <td>{{ item.lastTranslated ? formatDate(item.lastTranslated) : '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else>{{ $t('falara-translation-manager.general.noData') }}</p>

                    <div class="falara-content__pagination" v-if="totalPages > 1">
                        <mt-button variant="ghost" :disabled="currentPage <= 1" @click="prevPage">«</mt-button>
                        <span>{{ currentPage }} / {{ totalPages }}</span>
                        <mt-button variant="ghost" :disabled="currentPage >= totalPages" @click="nextPage">»</mt-button>
                    </div>
                </div>
            </mt-card>

            <div v-if="showTranslateModal" class="falara-content__modal-overlay">
                <mt-card :title="$t('falara-translation-manager.modal.title')" class="falara-content__modal">
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
    `,

    data() {
        return {
            isLoading: false,
            activeTab: 'product',
            searchTerm: '',
            items: [],
            selectedItems: [],
            currentPage: 1,
            totalPages: 1,
            pageSize: 25,
            totalItems: 0,
            showTranslateModal: false,
            salesChannelId: null,
            translationDefaults: {},
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

        onTabChange(tab) {
            this.activeTab = typeof tab === 'object' ? tab.name : tab;
            this.selectedItems = [];
            this.currentPage = 1;
            this.$router.replace({ params: { type: this.activeTab } });
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

        async onTranslate(data) {
            this.showTranslateModal = false;
            this.isLoading = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.translate(data);
                this.selectedItems = [];
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
                this.isLoading = false;
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
