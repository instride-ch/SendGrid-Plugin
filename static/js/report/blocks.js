pimcore.registerNS('pimcore.plugin.sendgrid.report.blocks');
pimcore.plugin.sendgrid.report.blocks = Class.create(pimcore.plugin.sendgrid.report.abstract, {

    url: '/plugin/SendGrid/admin_block/get',

    getName: function () {
        return t('sendgrid_blocks');
    },

    getIconCls: function () {
        return 'sendgrid_icon';
    },

    getActionFields: function () {
        return [
            {
                xtype: 'button',
                text: t('sendgrid_blocks_remove_all'),
                handler: function () {
                    Ext.Ajax.request({
                        url: '/plugin/SendGrid/admin_block/delete-all',
                        method: 'post',
                        params: {
                            site: this.getSiteField().getValue()
                        },
                        success: function (response) {
                            this.filter();
                        },
                    });
                }.bind(this)
            }
        ];
    },

    getGrid: function () {
        return new Ext.Panel({
            layout: 'fit',
            height: 275,
            items: {
                xtype: 'grid',
                store: this.getStore(),
                columns: [
                    {
                        text: t('email'),
                        dataIndex: 'email',
                        width: 300
                    },
                    {
                        text: t('reason'),
                        dataIndex: 'reason',
                        flex: 1
                    },
                    {
                        text: t('status'),
                        dataIndex: 'status',
                        width: 100
                    },
                    {
                        text: t('created'),
                        dataIndex: 'created',
                        width: 100
                    },
                    {
                        menuDisabled: true,
                        sortable: false,
                        xtype: 'actioncolumn',
                        width: 50,
                        items: [
                            {
                                iconCls: 'pimcore_icon_delete',
                                tooltip: t('sendgrid_block_remove'),
                                handler: function (grid, rowIndex) {
                                    var rec = grid.getStore().getAt(rowIndex);

                                    Ext.Ajax.request({
                                        url: '/plugin/SendGrid/admin_block/delete',
                                        method: 'post',
                                        params: {
                                            site: this.getSiteField().getValue(),
                                            email: rec.get('email')
                                        },
                                        success: function (response) {
                                            this.filter();
                                        }.bind(this),
                                    });
                                }.bind(this)
                            }
                        ]
                    }
                ]
            }
        });
    }
});
