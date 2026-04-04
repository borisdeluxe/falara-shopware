const { Component } = Shopware;

Component.register('falara-job-detail', {
    template: `
        <div>
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }">

                <a
                    href="#"
                    @click.prevent="goBack"
                    :style="{ display: 'inline-block', marginBottom: '20px', color: '#6366f1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }"
                >
                    ← Back to Jobs
                </a>

                <div v-if="isLoading" :style="{ textAlign: 'center', padding: '48px', color: '#6b7280' }">
                    Loading...
                </div>

                <div
                    v-else-if="job"
                    :style="{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px' }"
                >
                    <!-- Status Banner -->
                    <div
                        :style="{
                            background: statusBannerColor,
                            borderRadius: '8px',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }"
                    >
                        <span
                            :style="{
                                display: 'inline-block',
                                background: statusBadgeColor,
                                color: '#fff',
                                borderRadius: '20px',
                                padding: '4px 14px',
                                fontSize: '13px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }"
                        >{{ job.status }}</span>
                        <span :style="{ color: '#374151', fontSize: '14px' }">Job {{ job.falaraJobId }}</span>
                    </div>

                    <!-- Zombie Warning -->
                    <div
                        v-if="isZombie"
                        :style="{
                            background: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            color: '#92400e',
                            fontSize: '14px'
                        }"
                    >
                        ⚠ This job has been in <strong>{{ job.status }}</strong> for more than 15 minutes and may be stuck.
                    </div>

                    <!-- Info Grid -->
                    <div
                        :style="{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            marginBottom: '24px'
                        }"
                    >
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Falara Job ID</div>
                            <div :style="{ fontSize: '13px', color: '#111827', fontFamily: 'monospace', wordBreak: 'break-all' }">{{ job.falaraJobId || '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Type</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.resourceType || '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Target Language</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.targetLocale || '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Items</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.resourceCount != null ? job.resourceCount : '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Words</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.wordCount != null ? job.wordCount : '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Created</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ formatDate(job.createdAt) }}</div>
                        </div>
                        <div v-if="job.completedAt" :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Completed</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ formatDate(job.completedAt) }}</div>
                        </div>
                        <div v-if="job.projectName" :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Project</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.projectName }}</div>
                        </div>
                    </div>

                    <!-- Retry Button -->
                    <div v-if="job.status === 'writeback_failed'" :style="{ marginBottom: '24px' }">
                        <button
                            @click="retryWriteBack"
                            :disabled="isRetrying"
                            :style="{
                                background: isRetrying ? '#fca5a5' : '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: isRetrying ? 'not-allowed' : 'pointer'
                            }"
                        >
                            {{ isRetrying ? 'Retrying...' : 'Retry Write-Back' }}
                        </button>
                    </div>

                    <!-- Export Warnings -->
                    <div
                        v-if="hasExportWarnings"
                        :style="{
                            background: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '20px'
                        }"
                    >
                        <div :style="{ fontWeight: '600', color: '#92400e', marginBottom: '10px', fontSize: '14px' }">
                            ⚠ Export Warnings ({{ job.exportWarnings.length }})
                        </div>
                        <ul :style="{ margin: '0', paddingLeft: '20px' }">
                            <li
                                v-for="(warning, idx) in job.exportWarnings"
                                :key="idx"
                                :style="{ color: '#92400e', fontSize: '13px', marginBottom: '4px' }"
                            >{{ warning }}</li>
                        </ul>
                    </div>

                    <!-- Write-Back Errors -->
                    <div
                        v-if="hasWriteBackErrors"
                        :style="{
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            padding: '16px'
                        }"
                    >
                        <div
                            :style="{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: showErrors ? '12px' : '0',
                                cursor: 'pointer'
                            }"
                            @click="showErrors = !showErrors"
                        >
                            <span :style="{ fontWeight: '600', color: '#991b1b', fontSize: '14px' }">
                                Write-Back Errors ({{ job.writebackErrors.length }})
                            </span>
                            <span :style="{ color: '#991b1b', fontSize: '13px' }">
                                {{ showErrors ? '▲ Collapse' : '▼ Expand' }}
                            </span>
                        </div>
                        <div v-if="showErrors">
                            <div
                                v-for="(error, idx) in job.writebackErrors"
                                :key="idx"
                                :style="{
                                    background: '#fff',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    marginBottom: '8px'
                                }"
                            >
                                <div v-if="error.code" :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontFamily: 'monospace' }">{{ error.code }}</div>
                                <div :style="{ fontSize: '13px', color: '#7f1d1d' }">{{ error.message }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-else
                    :style="{
                        background: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        padding: '48px',
                        textAlign: 'center',
                        color: '#6b7280'
                    }"
                >
                    Job not found.
                </div>

            </div>
        </div>
    `,

    data() {
        return {
            isLoading: true,
            isRetrying: false,
            job: null,
            showErrors: false,
        };
    },

    computed: {
        statusBannerColor() {
            if (!this.job) return '#f9fafb';
            const map = {
                written_back: '#f0fdf4',
                completed: '#f0fdf4',
                pending: '#fffbeb',
                queued: '#fffbeb',
                processing: '#eff6ff',
                writing_back: '#eff6ff',
                failed: '#fef2f2',
                writeback_failed: '#fef2f2',
                dead: '#fef2f2',
            };
            return map[this.job.status] || '#f9fafb';
        },

        statusBadgeColor() {
            if (!this.job) return '#6b7280';
            const map = {
                written_back: '#16a34a',
                completed: '#16a34a',
                pending: '#d97706',
                queued: '#d97706',
                processing: '#2563eb',
                writing_back: '#2563eb',
                failed: '#dc2626',
                writeback_failed: '#dc2626',
                dead: '#dc2626',
            };
            return map[this.job.status] || '#6b7280';
        },

        isZombie() {
            if (!this.job) return false;
            if (!['pending', 'processing', 'queued'].includes(this.job.status)) return false;
            const created = new Date(this.job.createdAt);
            const diffMinutes = (Date.now() - created.getTime()) / 1000 / 60;
            return diffMinutes > 15;
        },

        hasExportWarnings() {
            return this.job && Array.isArray(this.job.exportWarnings) && this.job.exportWarnings.length > 0;
        },

        hasWriteBackErrors() {
            return this.job && Array.isArray(this.job.writebackErrors) && this.job.writebackErrors.length > 0;
        },
    },

    created() {
        this.loadJob();
    },

    methods: {
        async loadJob() {
            this.isLoading = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                const resp = await falaraApiService.getJob(this.$route.params.id);
                this.job = resp.data?.job || resp.data || null;
            } catch (e) {
                this.job = null;
            } finally {
                this.isLoading = false;
            }
        },

        async retryWriteBack() {
            this.isRetrying = true;
            try {
                const falaraApiService = Shopware.Service('falaraApiService');
                await falaraApiService.retryWriteBack(this.job.id);
                await this.loadJob();
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'success',
                    message: 'Write-back retry triggered successfully.',
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: 'Retry failed. Please try again.',
                });
            } finally {
                this.isRetrying = false;
            }
        },

        goBack() {
            this.$router.push({ name: 'falara.translation.manager.jobs' });
        },

        formatDate(dateStr) {
            if (!dateStr) return '—';
            return new Date(dateStr).toLocaleString();
        },
    },
});
