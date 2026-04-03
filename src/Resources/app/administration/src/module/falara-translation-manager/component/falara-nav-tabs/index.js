const { Component } = Shopware;

Component.register("falara-nav-tabs", {
    template: `
        <div :style="containerStyle">
            <div :style="headerStyle">
                <h1 :style="titleStyle">Falara Translation Manager</h1>
            </div>
            <nav :style="barStyle">
                <button
                    v-for="tab in tabs"
                    :key="tab.route"
                    :style="isActive(tab.route) ? activeTabStyle : tabStyle"
                    @click="navigate(tab.route)"
                    @mouseenter="$event.target.style.color = '#1a73e8'; $event.target.style.background = '#f0f4ff'"
                    @mouseleave="!isActive(tab.route) && ($event.target.style.color = '#6b7280', $event.target.style.background = 'none')"
                >
                    {{ $t(tab.label) }}
                </button>
            </nav>
        </div>
    `,

    computed: {
        containerStyle() {
            return {
                background: "#fff",
                borderBottom: "1px solid #d1d5db",
                margin: "-20px -20px 24px -20px",
                padding: "0",
                borderRadius: "8px 8px 0 0",
            };
        },
        headerStyle() {
            return { padding: "24px 32px 0 32px" };
        },
        titleStyle() {
            return {
                fontSize: "24px",
                fontWeight: "700",
                color: "#1a1a2e",
                margin: "0 0 16px 0",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            };
        },
        barStyle() {
            return {
                display: "flex",
                gap: "0",
                padding: "0 32px",
                borderTop: "1px solid #e5e7eb",
            };
        },
        tabStyle() {
            return {
                background: "none",
                border: "none",
                borderBottom: "3px solid transparent",
                padding: "14px 20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#6b7280",
                whiteSpace: "nowrap",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                transition: "all 0.15s ease",
            };
        },
        activeTabStyle() {
            return {
                ...this.tabStyle,
                color: "#1a73e8",
                borderBottomColor: "#1a73e8",
                fontWeight: "600",
            };
        },
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
