const { Component } = Shopware;

Component.register('falara-quota-widget', {
    template: `
        <div class="falara-quota-widget">
            <div class="falara-quota-widget__header">
                <span class="falara-quota-widget__plan">{{ $t('falara-translation-manager.quota.plan') }}: <strong>{{ usage.plan || '-' }}</strong></span>
                <span class="falara-quota-widget__numbers">{{ usage.used || 0 }} / {{ usage.limit || 0 }}</span>
            </div>
            <mt-progress-bar
                :value="progressValue"
                :max="100"
            />
            <div v-if="isExceeded" class="falara-quota-widget__alert falara-quota-widget__alert--danger">
                {{ $t('falara-translation-manager.quota.exceeded') }}
            </div>
            <div v-else-if="isWarning" class="falara-quota-widget__alert falara-quota-widget__alert--warning">
                {{ $t('falara-translation-manager.quota.warningThreshold') }}
            </div>
            <div class="falara-quota-widget__remaining">
                {{ $t('falara-translation-manager.quota.remaining') }}: {{ remaining }}
            </div>
        </div>
    `,

    props: {
        usage: {
            type: Object,
            required: true,
            default: () => ({ plan: '', used: 0, limit: 0 }),
        },
    },

    computed: {
        progressValue() {
            if (!this.usage.limit || this.usage.limit === 0) {
                return 0;
            }
            return Math.min(Math.round((this.usage.used / this.usage.limit) * 100), 100);
        },

        isWarning() {
            return this.progressValue >= 80 && this.progressValue < 100;
        },

        isExceeded() {
            return this.progressValue >= 100;
        },

        remaining() {
            const rem = (this.usage.limit || 0) - (this.usage.used || 0);
            return Math.max(rem, 0);
        },
    },
});
