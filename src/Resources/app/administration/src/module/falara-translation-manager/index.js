import './page/falara-dashboard';
import './page/falara-content';
import './page/falara-jobs';
import './page/falara-job-detail';
import './page/falara-audit';
import './page/falara-settings';
import './component/falara-status-badge';
import './component/falara-quota-widget';
import './component/falara-translate-modal';
import './component/falara-nav-tabs';

const { Module } = Shopware;

Module.register('falara-translation-manager', {
    type: 'plugin',
    name: 'falara-translation-manager.general.title',
    title: 'falara-translation-manager.general.title',
    description: 'falara-translation-manager.general.description',
    color: '#1a73e8',
    icon: 'regular-language',

    snippets: {
        'de-DE': () => import('./snippet/de-DE.json'),
        'en-GB': () => import('./snippet/en-GB.json'),
    },

    routes: {
        dashboard: {
            component: 'falara-dashboard',
            path: 'dashboard',
        },
        content: {
            component: 'falara-content',
            path: 'content/:type?',
        },
        jobs: {
            component: 'falara-jobs',
            path: 'jobs',
        },
        'job-detail': {
            component: 'falara-job-detail',
            path: 'jobs/:id',
        },
        audit: {
            component: 'falara-audit',
            path: 'audit',
        },
        settings: {
            component: 'falara-settings',
            path: 'settings',
        },
    },

    navigation: [
        {
            label: 'falara-translation-manager.general.title',
            color: '#1a73e8',
            icon: 'regular-language',
            path: 'falara.translation.manager.dashboard',
            parent: 'sw-settings',
            position: 100,
        },
    ],
});
