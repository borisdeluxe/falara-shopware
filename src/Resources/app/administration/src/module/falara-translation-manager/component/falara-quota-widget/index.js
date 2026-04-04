const { Component } = Shopware;

Component.register('falara-quota-widget', {
    template: `
        <div :style="containerStyle">
            <div :style="headerStyle">
                <span :style="planStyle">Plan: <strong>{{ planName }}</strong></span>
                <span :style="numbersStyle">{{ wordsUsed.toLocaleString() }} / {{ wordsLimit.toLocaleString() }}</span>
            </div>
            <div :style="barBgStyle">
                <div :style="barFillStyle"></div>
            </div>
            <div :style="footerStyle">
                <span :style="remainingStyle">Remaining: {{ wordsRemaining.toLocaleString() }}</span>
                <span v-if="bonusWords > 0" :style="bonusStyle">+{{ bonusWords.toLocaleString() }} bonus</span>
            </div>
            <div v-if="isExceeded" :style="alertDangerStyle">Quota exhausted. Please upgrade your plan.</div>
            <div v-else-if="isWarning" :style="alertWarningStyle">You have used over 80% of your quota.</div>
        </div>
    `,

    props: {
        usage: { type: Object, required: true, default: () => ({}) },
    },

    computed: {
        wordsUsed() { return this.usage.wordsUsed || this.usage.used || 0; },
        wordsLimit() { return this.usage.wordsLimit || this.usage.limit || 0; },
        wordsRemaining() { return this.usage.wordsRemaining || Math.max(this.wordsLimit - this.wordsUsed, 0); },
        planName() { return this.usage.plan || '-'; },
        bonusWords() { return this.usage.bonusWordsAvailable || 0; },
        progressValue() {
            if (this.wordsLimit === 0) return 0;
            return Math.min(Math.round((this.wordsUsed / this.wordsLimit) * 100), 100);
        },
        isWarning() { return this.progressValue >= 80 && this.progressValue < 100; },
        isExceeded() { return this.progressValue >= 100; },

        containerStyle() { return { background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '20px' }; },
        headerStyle() { return { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }; },
        planStyle() { return { fontSize: '14px', color: '#374151' }; },
        numbersStyle() { return { fontSize: '14px', color: '#6b7280', fontWeight: '500' }; },
        barBgStyle() { return { height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }; },
        barFillStyle() {
            const color = this.isExceeded ? '#ef4444' : this.isWarning ? '#f59e0b' : '#22c55e';
            return { height: '100%', width: this.progressValue + '%', background: color, borderRadius: '4px', transition: 'width 0.3s ease' };
        },
        footerStyle() { return { display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }; },
        remainingStyle() { return { color: '#6b7280' }; },
        bonusStyle() { return { color: '#3b82f6', fontWeight: '500' }; },
        alertDangerStyle() { return { marginTop: '10px', padding: '8px 12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px' }; },
        alertWarningStyle() { return { marginTop: '10px', padding: '8px 12px', background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '13px' }; },
    },
});
