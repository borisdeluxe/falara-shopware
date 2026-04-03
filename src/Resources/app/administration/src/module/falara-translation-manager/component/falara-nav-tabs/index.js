const { Component } = Shopware;

Component.register("falara-nav-tabs", {
    template: `
        <div class="falara-nav-tabs">
            <div class="falara-nav-tabs__header">
                <h1 class="falara-nav-tabs__title">Falara Translation Manager</h1>
            </div>
            <nav class="falara-nav-tabs__bar">
                <button
                    v-for="tab in tabs"
                    :key="tab.route"
                    class="falara-nav-tabs__tab"
                    :class="{ 'falara-nav-tabs__tab--active': isActive(tab.route) }"
                    @click="navigate(tab.route)"
                >
                    {{ $t(tab.label) }}
                </button>
            </nav>
            <style>
                .falara-nav-tabs {
                    background: #fff;
                    border-bottom: 1px solid #d1d5db;
                    margin: -24px -24px 24px -24px;
                    padding: 0;
                }
                .falara-nav-tabs__header {
                    padding: 20px 32px 0 32px;
                }
                .falara-nav-tabs__title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin: 0 0 16px 0;
                }
                .falara-nav-tabs__bar {
                    display: flex;
                    gap: 0;
                    padding: 0 32px;
                }
                .falara-nav-tabs__tab {
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    padding: 12px 20px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b7280;
                    transition: all 0.15s ease;
                    white-space: nowrap;
                }
                .falara-nav-tabs__tab:hover {
                    color: #1a73e8;
                    background: #f0f4ff;
                }
                .falara-nav-tabs__tab--active {
                    color: #1a73e8;
                    border-bottom-color: #1a73e8;
                    font-weight: 600;
                }
            </style>
        </div>
    `,

    computed: {
        tabs() {
            return [
                { route: "falara.translation.manager.dashboard", label: "falara-translation-manager.nav.dashboard" },
                { route: "falara.translation.manager.content", label: "falara-translation-manager.nav.content" },
                { route: "falara.translation.manager.jobs", label: "falara-translation-manager.nav.jobs" },
                { route: "falara.translation.manager.audit", label: "falara-translation-manager.nav.audit" },
                { route: "falara.translation.manager.settings", label: "falara-translation-manager.nav.settings" },
            ];
        },
    },

    methods: {
        isActive(routeName) {
            const current = this.$route.name;
            if (!current) return false;
            if (current === routeName) return true;
            if (routeName === "falara.translation.manager.jobs" && current === "falara.translation.manager.job-detail") return true;
            return false;
        },

        navigate(routeName) {
            if (!this.isActive(routeName)) {
                this.$router.push({ name: routeName });
            }
        },
    },
});
