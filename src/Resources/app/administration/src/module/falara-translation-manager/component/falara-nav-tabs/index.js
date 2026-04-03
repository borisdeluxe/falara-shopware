const { Component } = Shopware;

Component.register('falara-nav-tabs', {
    template: `
        <div class="falara-nav-tabs">
            <button
                v-for="tab in tabs"
                :key="tab.route"
                class="falara-nav-tabs__tab"
                :class="{ 'falara-nav-tabs__tab--active': isActive(tab.route) }"
                @click="navigate(tab.route)"
            >
                {{ $t(tab.label) }}
            </button>
            <style>
                .falara-nav-tabs {
                    display: flex;
                    flex-direction: row;
                    border-bottom: 2px solid #e0e0e0;
                    margin-bottom: 20px;
                    gap: 0;
                }
                .falara-nav-tabs__tab {
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    margin-bottom: -2px;
                    padding: 10px 20px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b7280;
                    transition: color 0.2s, border-color 0.2s;
                }
                .falara-nav-tabs__tab:hover {
                    color: #1a73e8;
                }
                .falara-nav-tabs__tab--active {
                    color: #1a73e8;
                    border-bottom-color: #1a73e8;
                }
            </style>
        </div>
    `,

    computed: {
        tabs() {
            return [
                { route: 'falara.translation.manager.dashboard', label: 'falara-translation-manager.nav.dashboard' },
                { route: 'falara.translation.manager.content', label: 'falara-translation-manager.nav.content' },
                { route: 'falara.translation.manager.jobs', label: 'falara-translation-manager.nav.jobs' },
                { route: 'falara.translation.manager.audit', label: 'falara-translation-manager.nav.audit' },
                { route: 'falara.translation.manager.settings', label: 'falara-translation-manager.nav.settings' },
            ];
        },
    },

    methods: {
        isActive(routeName) {
            const current = this.$route.name;
            if (!current) return false;
            if (current === routeName) return true;
            // Mark jobs tab active for job-detail page too
            if (routeName === 'falara.translation.manager.jobs' && current === 'falara.translation.manager.job.detail') {
                return true;
            }
            return false;
        },

        navigate(routeName) {
            if (!this.isActive(routeName)) {
                this.$router.push({ name: routeName });
            }
        },
    },
});
