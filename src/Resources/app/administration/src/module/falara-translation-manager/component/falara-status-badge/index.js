const { Component } = Shopware;

Component.register('falara-status-badge', {
    template: `
        <div class="falara-status-badge" :class="badgeClass" :title="tooltipText">
            <span class="falara-status-badge__dot"></span>
            <span class="falara-status-badge__label">{{ labelText }}</span>
        </div>
    `,

    props: {
        status: {
            type: String,
            required: true,
        },
    },

    computed: {
        badgeClass() {
            const colorMap = {
                pending: 'falara-status-badge--yellow',
                queued: 'falara-status-badge--yellow',
                processing: 'falara-status-badge--blue',
                writing_back: 'falara-status-badge--blue',
                completed: 'falara-status-badge--green',
                written_back: 'falara-status-badge--green',
                needs_review: 'falara-status-badge--green',
                failed: 'falara-status-badge--red',
                dead: 'falara-status-badge--red',
                writeback_failed: 'falara-status-badge--red',
            };
            return colorMap[this.status] || 'falara-status-badge--grey';
        },

        labelText() {
            const key = `falara-translation-manager.status.${this.status}`;
            return this.$t(key);
        },

        tooltipText() {
            const key = `falara-translation-manager.status.${this.status}_tooltip`;
            return this.$t(key);
        },
    },
});
