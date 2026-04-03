const { Component } = Shopware;

Component.register('falara-translate-modal', {
    template: `
        <div :style="containerStyle">
            <div :style="summaryStyle">
                <span>{{ items.length }} {{ items.length === 1 ? 'item' : 'items' }} selected</span>
            </div>

            <div :style="sectionStyle">
                <label :style="labelStyle">{{ $t('falara-translation-manager.modal.targetLanguages') }}</label>
                <div :style="langGridStyle">
                    <div
                        v-for="lang in availableLanguages"
                        :key="lang.id"
                        :style="langItemStyle"
                    >
                        <input
                            type="checkbox"
                            :id="'lang-' + lang.id"
                            :value="lang.id"
                            v-model="selectedLanguages"
                            :style="checkboxStyle"
                        />
                        <label :for="'lang-' + lang.id" :style="checkboxLabelStyle">{{ lang.name }}</label>
                    </div>
                </div>
            </div>

            <div :style="sectionStyle">
                <label :style="labelStyle">{{ $t('falara-translation-manager.modal.glossary') }}</label>
                <select v-model="selectedGlossary" :style="selectStyle">
                    <option :value="null">{{ $t('falara-translation-manager.modal.noGlossary') }}</option>
                    <option v-for="g in glossaries" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
            </div>

            <div :style="sectionStyle">
                <button :style="toggleStyle" @click="showAdvanced = !showAdvanced">
                    {{ $t('falara-translation-manager.modal.advancedOptions') }}
                    <span>{{ showAdvanced ? ' ▲' : ' ▼' }}</span>
                </button>

                <div v-if="showAdvanced" :style="advancedContentStyle">
                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.domain') }}</label>
                        <mt-text-field v-model="form.domain" />
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.tone') }}</label>
                        <mt-text-field v-model="form.tone" />
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.quality') }}</label>
                        <select v-model="form.quality" :style="selectStyle">
                            <option value="draft">Draft</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.instructions') }}</label>
                        <mt-textarea v-model="form.instructions" />
                    </div>
                </div>
            </div>

            <div :style="actionsStyle">
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
        containerStyle() {
            return {
                background: '#ffffff',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                fontFamily: 'inherit',
            };
        },
        summaryStyle() {
            return {
                display: 'inline-block',
                background: '#f3f4f6',
                borderRadius: '999px',
                padding: '4px 16px',
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '20px',
                fontWeight: '500',
            };
        },
        sectionStyle() {
            return {
                marginBottom: '20px',
            };
        },
        langGridStyle() {
            return {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '8px',
            };
        },
        langItemStyle() {
            return {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            };
        },
        checkboxStyle() {
            return {
                cursor: 'pointer',
                width: '15px',
                height: '15px',
                flexShrink: '0',
            };
        },
        checkboxLabelStyle() {
            return {
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
            };
        },
        selectStyle() {
            return {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff',
                color: '#111827',
                outline: 'none',
                cursor: 'pointer',
                height: '40px',
            };
        },
        labelStyle() {
            return {
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px',
            };
        },
        toggleStyle() {
            return {
                background: 'none',
                border: 'none',
                padding: '0',
                fontSize: '13px',
                fontWeight: '600',
                color: '#6366f1',
                cursor: 'pointer',
                textDecoration: 'underline',
            };
        },
        advancedContentStyle() {
            return {
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            };
        },
        fieldGroupStyle() {
            return {
                display: 'flex',
                flexDirection: 'column',
            };
        },
        actionsStyle() {
            return {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
                marginTop: '4px',
            };
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
            const criteria = new Shopware.Data.Criteria();
            criteria.addAssociation('locale');
            languageRepository.search(criteria, Shopware.Context.api).then(result => {
                this.availableLanguages = result.map(lang => ({
                    id: lang.id,
                    name: lang.name || lang.locale?.name || lang.id,
                }));
            }).catch(() => {
                this.availableLanguages = [];
            });
        },

        loadGlossaries() {
            const falaraApiService = Shopware.Service('falaraApiService');
            falaraApiService.getGlossaries(this.salesChannelId).then(response => {
                const data = response.data;
                this.glossaries = Array.isArray(data) ? data : (data?.glossaries || data?.items || []);
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
