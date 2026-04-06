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
                            :value="lang.code"
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
                        <select v-model="form.domain" :style="selectStyle">
                            <option value="">None</option>
                            <option value="e-commerce">E-Commerce</option>
                            <option value="marketing">Marketing</option>
                            <option value="legal">Legal</option>
                            <option value="medical">Medical</option>
                            <option value="technical">Technical</option>
                            <option value="software">Software</option>
                        </select>
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.tone') }}</label>
                        <select v-model="form.tone" :style="selectStyle">
                            <option value="">None</option>
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                            <option value="technical">Technical</option>
                        </select>
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.quality') }}</label>
                        <select v-model="form.quality" :style="selectStyle">
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
        getLanguageList() {
            return [
                { id: 'de', name: 'German (de)', code: 'de' },
                { id: 'de-AT', name: 'German - Austria (de-AT)', code: 'de-AT' },
                { id: 'de-CH', name: 'German - Switzerland (de-CH)', code: 'de-CH' },
                { id: 'en-GB', name: 'English - UK (en-GB)', code: 'en-GB' },
                { id: 'en-US', name: 'English - US (en-US)', code: 'en-US' },
                { id: 'fr', name: 'French (fr)', code: 'fr' },
                { id: 'fr-BE', name: 'French - Belgium (fr-BE)', code: 'fr-BE' },
                { id: 'fr-CH', name: 'French - Switzerland (fr-CH)', code: 'fr-CH' },
                { id: 'fr-CA', name: 'French - Canada (fr-CA)', code: 'fr-CA' },
                { id: 'es', name: 'Spanish (es)', code: 'es' },
                { id: 'it', name: 'Italian (it)', code: 'it' },
                { id: 'it-CH', name: 'Italian - Switzerland (it-CH)', code: 'it-CH' },
                { id: 'nl', name: 'Dutch (nl)', code: 'nl' },
                { id: 'nl-BE', name: 'Dutch - Belgium (nl-BE)', code: 'nl-BE' },
                { id: 'pt-PT', name: 'Portuguese - Portugal (pt-PT)', code: 'pt-PT' },
                { id: 'pt-BR', name: 'Portuguese - Brazil (pt-BR)', code: 'pt-BR' },
                { id: 'pl', name: 'Polish (pl)', code: 'pl' },
                { id: 'cs', name: 'Czech (cs)', code: 'cs' },
                { id: 'da', name: 'Danish (da)', code: 'da' },
                { id: 'sv', name: 'Swedish (sv)', code: 'sv' },
                { id: 'fi', name: 'Finnish (fi)', code: 'fi' },
                { id: 'no', name: 'Norwegian (no)', code: 'no' },
                { id: 'hu', name: 'Hungarian (hu)', code: 'hu' },
                { id: 'ro', name: 'Romanian (ro)', code: 'ro' },
                { id: 'bg', name: 'Bulgarian (bg)', code: 'bg' },
                { id: 'hr', name: 'Croatian (hr)', code: 'hr' },
                { id: 'sk', name: 'Slovak (sk)', code: 'sk' },
                { id: 'sl', name: 'Slovenian (sl)', code: 'sl' },
                { id: 'el', name: 'Greek (el)', code: 'el' },
                { id: 'tr', name: 'Turkish (tr)', code: 'tr' },
                { id: 'ru', name: 'Russian (ru)', code: 'ru' },
                { id: 'uk', name: 'Ukrainian (uk)', code: 'uk' },
            ];
        },

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
            this.availableLanguages = this.getLanguageList();
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
