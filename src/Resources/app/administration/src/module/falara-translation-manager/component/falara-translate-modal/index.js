const { Component } = Shopware;

Component.register('falara-translate-modal', {
    template: `
        <div class="falara-translate-modal">
            <div class="falara-translate-modal__summary">
                <p>{{ $t('falara-translation-manager.modal.itemCount', { count: items.length }) }}</p>
            </div>

            <div class="falara-translate-modal__languages">
                <h3>{{ $t('falara-translation-manager.modal.targetLanguages') }}</h3>
                <div v-for="lang in availableLanguages" :key="lang.id" class="falara-translate-modal__lang-option">
                    <mt-checkbox
                        :label="lang.name"
                        :checked="selectedLanguages.includes(lang.id)"
                        @change="toggleLanguage(lang.id)"
                    />
                </div>
            </div>

            <div class="falara-translate-modal__glossary">
                <mt-select
                    :label="$t('falara-translation-manager.modal.glossary')"
                    v-model="selectedGlossary"
                    :options="glossaryOptions"
                />
            </div>

            <div class="falara-translate-modal__advanced">
                <button class="falara-translate-modal__toggle" @click="showAdvanced = !showAdvanced">
                    {{ $t('falara-translation-manager.modal.advancedOptions') }}
                    <span>{{ showAdvanced ? '▲' : '▼' }}</span>
                </button>
                <div v-if="showAdvanced" class="falara-translate-modal__advanced-content">
                    <mt-text-field
                        :label="$t('falara-translation-manager.modal.domain')"
                        v-model="form.domain"
                    />
                    <mt-text-field
                        :label="$t('falara-translation-manager.modal.tone')"
                        v-model="form.tone"
                    />
                    <mt-select
                        :label="$t('falara-translation-manager.modal.quality')"
                        v-model="form.quality"
                        :options="qualityOptions"
                    />
                    <mt-textarea
                        :label="$t('falara-translation-manager.modal.instructions')"
                        v-model="form.instructions"
                    />
                </div>
            </div>

            <div class="falara-translate-modal__actions">
                <mt-button variant="ghost" @click="$emit('cancel')">
                    {{ $t('falara-translation-manager.modal.cancel') }}
                </mt-button>
                <mt-button
                    variant="primary"
                    :disabled="selectedLanguages.length === 0"
                    @click="onTranslate"
                >
                    {{ $t('falara-translation-manager.modal.translate') }}
                </mt-button>
            </div>
        </div>
    `,

    emits: ['translate', 'cancel'],

    props: {
        items: {
            type: Array,
            required: true,
            default: () => [],
        },
        salesChannelId: {
            type: String,
            required: true,
        },
        defaults: {
            type: Object,
            default: () => ({}),
        },
    },

    data() {
        return {
            selectedLanguages: [],
            selectedGlossary: null,
            showAdvanced: false,
            availableLanguages: [],
            glossaries: [],
            form: {
                domain: '',
                tone: '',
                quality: 'standard',
                instructions: '',
            },
        };
    },

    computed: {
        glossaryOptions() {
            const none = [{ value: null, label: this.$t('falara-translation-manager.modal.noGlossary') }];
            return none.concat(
                this.glossaries.map(g => ({ value: g.id, label: g.name }))
            );
        },

        qualityOptions() {
            return [
                { value: 'draft', label: 'Draft' },
                { value: 'standard', label: 'Standard' },
                { value: 'premium', label: 'Premium' },
            ];
        },
    },

    created() {
        this.loadLanguages();
        this.loadGlossaries();
        this.applyDefaults();
    },

    methods: {
        applyDefaults() {
            if (this.defaults) {
                this.form.domain = this.defaults.domain || '';
                this.form.tone = this.defaults.tone || '';
                this.form.quality = this.defaults.quality || 'standard';
                this.form.instructions = this.defaults.instructions || '';
                if (this.defaults.targetLanguages) {
                    this.selectedLanguages = [...this.defaults.targetLanguages];
                }
                if (this.defaults.glossaryId) {
                    this.selectedGlossary = this.defaults.glossaryId;
                }
            }
        },

        loadLanguages() {
            const languageRepository = Shopware.Service('repositoryFactory').create('language');
            languageRepository.search(
                Shopware.Data.Criteria.fromCriteria({ associations: ['locale'] }),
                Shopware.Context.api
            ).then(result => {
                this.availableLanguages = result.map(lang => ({
                    id: lang.id,
                    name: lang.name,
                }));
            }).catch(() => {
                this.availableLanguages = [];
            });
        },

        loadGlossaries() {
            const falaraApiService = Shopware.Service('falaraApiService');
            falaraApiService.getGlossaries(this.salesChannelId).then(response => {
                this.glossaries = response.data || [];
            }).catch(() => {
                this.glossaries = [];
            });
        },

        toggleLanguage(langId) {
            const idx = this.selectedLanguages.indexOf(langId);
            if (idx > -1) {
                this.selectedLanguages.splice(idx, 1);
            } else {
                this.selectedLanguages.push(langId);
            }
        },

        onTranslate() {
            if (this.selectedLanguages.length === 0) {
                return;
            }
            this.$emit('translate', {
                items: this.items,
                salesChannelId: this.salesChannelId,
                targetLanguages: this.selectedLanguages,
                glossaryId: this.selectedGlossary,
                ...this.form,
            });
        },
    },
});
