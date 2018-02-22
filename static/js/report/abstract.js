pimcore.registerNS('pimcore.plugin.sendgrid.report.abstract');
pimcore.plugin.sendgrid.report.abstract = Class.create(pimcore.report.abstract, {

    url: '',
    remoteSort: false,

    matchType: function (type) {
        var types = ['global'];
        return !!pimcore.report.abstract.prototype.matchTypeValidate(type, types);
    },

    getName: function () {
        return 'sendgrid';
    },

    getIconCls: function () {
        return 'sendgrid_icon_report';
    },

    getGrid: function () {
        return false;
    },

    getSiteField: function () {
        return this.panel.down('[name=site]');
    },

    showPaginator: function () {
        return false;
    },

    getDocketItemsForPanel: function () {
        var dockedFields = this.getFilterFields();
        var actionFields = this.getActionFields();

        if (actionFields.length > 0) {
            dockedFields.push('->');
            dockedFields.push.apply(dockedFields, actionFields);
        }

        return [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: dockedFields
            }
        ];
    },

    getPanel: function () {
        if (!this.panel) {

            var bbar = null;

            if (this.showPaginator() !== false) {
                bbar = pimcore.helpers.grid.buildDefaultPagingToolbar(this.getStore());
            }

            this.panel = new Ext.Panel({
                title: this.getName(),
                layout: 'fit',
                border: false,
                items: [],
                bbar: bbar,
                dockedItems: this.getDocketItemsForPanel()
            });

            var grid = this.getGrid();

            if (grid) {
                this.panel.add(grid);
            }

            this.filter();
        }

        return this.panel;
    },

    getActionFields: function() {
        return [];
    },

    getFilterFields: function () {
        return [
            {
                xtype: 'combo',
                fieldLabel: t('site'),
                typeAhead: true,
                mode: 'local',
                listWidth: 100,
                store: pimcore.globalmanager.get('sendgrid_sites'),
                displayField: 'name',
                valueField: 'id',
                forceSelection: true,
                triggerAction: 'all',
                name: 'site',
                listeners: {
                    change: function () {
                        this.filter();
                    }.bind(this),
                    render: function() {
                        var store = pimcore.globalmanager.get('sendgrid_sites');
                        if (store.getRange().length > 0) {
                            this.setValue(store.getRange()[0].getId());
                        }
                    }
                }
            }
        ];
    },

    getStore: function () {
        if (!this.store) {
            var me = this,
                fields = ['timestamp', 'text', 'data'];

            if (Ext.isFunction(this.getStoreFields)) {
                fields = Ext.apply(fields, this.getStoreFields());
            }

            this.store = new Ext.data.Store({
                autoDestroy: true,
                remoteSort: this.remoteSort,
                proxy: {
                    type: 'ajax',
                    url: this.url,
                    actionMethods: {
                        read: 'POST'
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total'
                    }
                },
                fields: fields
            });

            this.store.on('beforeload', function (store, operation) {
                store.getProxy().setExtraParams(me.getFilterParams());
            });
        }

        return this.store;
    },

    filter: function () {
        if (this.getSiteField().getValue()) {
            this.getStore().load();
        }
    },

    getFilterParams: function () {
        return {
            'site': this.getSiteField().getValue(),
        };
    }
});

