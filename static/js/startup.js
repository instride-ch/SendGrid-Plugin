pimcore.registerNS('pimcore.plugin.sendgrid');
pimcore.registerNS('pimcore.plugin.sendgrid.settings');

pimcore.plugin.sendgrid = Class.create(pimcore.plugin.admin, {
    getClassName: function () {
        return 'pimcore.plugin.sendgrid';
    },

    initialize: function () {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function (params, broker) {
        var user = pimcore.globalmanager.get('user');

        if (user.admin === true) {
            var sendGridMenu = new Ext.Action({
                text: t('sendgrid'),
                iconCls: 'sendgrid_icon',
                handler: function () {
                    try {
                        pimcore.globalmanager.get('sendgrid_settings').activate();
                    }
                    catch (e) {
                        pimcore.globalmanager.add('sendgrid_settings', new pimcore.plugin.sendgrid.settings());
                    }
                }
            });

            layoutToolbar.settingsMenu.add(sendGridMenu);
        }

        // sites
        var authorizedSitesProxy = new Ext.data.HttpProxy({
            url: '/plugin/SendGrid/admin_settings/sites'
        });
        var sitesReader = new Ext.data.JsonReader({}, ["id", "name"]);

        var sitesStore = new Ext.data.Store({
            restful: false,
            proxy: authorizedSitesProxy,
            reader: sitesReader
        });

        sitesStore.load();
        pimcore.globalmanager.add("sendgrid_sites", sitesStore);

        pimcore.report.broker.addGroup('sendgrid', 'sendgrid_reports', 'sendgrid_icon');

        Ext.Object.each(pimcore.plugin.sendgrid.report, function (report) {
            if (report === 'abstract') {
                return true;
            }

            report = pimcore.plugin.sendgrid.report[report];

            pimcore.report.broker.addReport(report, 'sendgrid', {
                name: report.prototype.getName(),
                text: report.prototype.getName(),
                niceName: report.prototype.getName(),
                iconCls: report.prototype.getIconCls()
            });
        });
    },

    postOpenDocument: function (tab, type) {
        if (type === 'newsletter') {
            var statsTab = new pimcore.plugin.sendgrid.newsletter.categoryCharts(tab);

            tab.tabbar.add(statsTab.getPanel());
        }
    },
});

var sendgridPlugin = new pimcore.plugin.sendgrid();
