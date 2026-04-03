const { Component } = Shopware;

Component.register('falara-job-detail', {
    template: `
        <div class="falara-job-detail">
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <mt-card :title="$t('falara-translation-manager.jobDetail.title')">
                    <mt-button variant="ghost" @click="goBack" class="falara-job-detail__back">
                        ← {{ $t('falara-translation-manager.jobDetail.back') }}
                    </mt-button>

                    <mt-loader v-if="isLoading" />

                    <div v-else-if="job">
                        <div
                            v-if="isZombie"
                            class="falara-job-detail__zombie-warning"
                        >
                            ⚠ {{ $t('falara-translation-manager.jobDetail.zombieWarning') }}
                        </div>

                        <div class="falara-job-detail__status-banner" :class="statusBannerClass">
                            <falara-status-badge :status="job.status" />
                        </div>

                        <div class="falara-job-detail__info">
                            <div class="falara-job-detail__info-row">
                                <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.sourceLanguage') }}</span>
                                <span>{{ job.sourceLanguage }}</span>
                            </div>
                            <div class="falara-job-detail__info-row">
                                <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.targetLanguage') }}</span>
                                <span>{{ job.targetLanguage }}</span>
                            </div>
                            <div class="falara-job-detail__info-row">
                                <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.itemCount') }}</span>
                                <span>{{ job.itemCount }}</span>
                            </div>
                            <div class="falara-job-detail__info-row" v-if="job.wordCount">
                                <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.wordCount') }}</span>
                                <span>{{ job.wordCount }}</span>
                            </div>
                            <div class="falara-job-detail__info-row">
                                <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.createdAt') }}</span>
                                <span>{{ formatDate(job.createdAt) }}</span>
                            </div>
                            <div class="falara-job-detail__info-row" v-if="job.completedAt">
                                <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.completedAt') }}</span>
                                <span>{{ formatDate(job.completedAt) }}</span>
                            </div>
                        </div>

                        <div class="falara-job-detail__actions" v-if="job.status === 'writeback_failed'">
                            <mt-button variant="primary" @click="retryWriteBack" :disabled="isRetrying">
                                {{ isRetrying ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.jobDetail.retryWriteBack') }}
                            </mt-button>
                        </div>

                        <div class="falara-job-detail__errors" v-if="hasWriteBackErrors">
                            <div class="falara-job-detail__errors-header">
                                <h3>{{ $t('falara-translation-manager.jobDetail.writeBackErrors') }}</h3>
                                <mt-button variant="ghost" size="small" @click="showErrors = !showErrors">
                                    {{ showErrors ? $t('falara-translation-manager.jobDetail.collapseErrors') : $t('falara-translation-manager.jobDetail.expandErrors') }}
                                </mt-button>
                            </div>
                            <div v-if="showErrors" class="falara-job-detail__errors-list">
                                <div
                                    v-for="(error, idx) in job.writeBackErrors"
                                    :key="idx"
                                    class="falara-job-detail__error-item"
                                >
                                    <span class="falara-job-detail__error-field">{{ error.field || error.entityId }}</span>
                                    <span class="falara-job-detail__error-message">{{ error.message }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else>
                        <p>{{ $t('falara-translation-manager.general.noData') }}</p>
                    </div>
                </mt-card>
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
        hasWriteBackErrors() {
            return this.job && Array.isArray(this.job.writeBackErrors) && this.job.writeBackErrors.length > 0;
        },

        isZombie() {
            if (!this.job || !['processing', 'writing_back'].includes(this.job.status)) {
                return false;
            }
            const updatedAt = new Date(this.job.updatedAt || this.job.createdAt);
            const diffMinutes = (Date.now() - updatedAt.getTime()) / 1000 / 60;
            return diffMinutes > 10;
        },

        statusBannerClass() {
            const colorMap = {
                pending: 'falara-job-detail__status-banner--yellow',
                queued: 'falara-job-detail__status-banner--yellow',
                processing: 'falara-job-detail__status-banner--blue',
                writing_back: 'falara-job-detail__status-banner--blue',
                completed: 'falara-job-detail__status-banner--green',
                written_back: 'falara-job-detail__status-banner--green',
                needs_review: 'falara-job-detail__status-banner--green',
                failed: 'falara-job-detail__status-banner--red',
                dead: 'falara-job-detail__status-banner--red',
                writeback_failed: 'falara-job-detail__status-banner--red',
            };
            return this.job ? (colorMap[this.job.status] || '') : '';
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
                this.job = resp.data || null;
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
                    message: this.$t('falara-translation-manager.general.success'),
                });
            } catch (e) {
                Shopware.State.dispatch('notification/createNotification', {
                    type: 'error',
                    message: this.$t('falara-translation-manager.general.error'),
                });
            } finally {
                this.isRetrying = false;
            }
        },

        goBack() {
            this.$router.push({ name: 'falara.translation.manager.jobs' });
        },

        formatDate(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString();
        },
    },
});
