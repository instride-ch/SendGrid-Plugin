pimcore.registerNS('pimcore.plugin.sendgrid.newsletter.categoryCharts');
pimcore.plugin.sendgrid.newsletter.categoryCharts = Class.create({
    data: null,

    initialize: function (data) {
        this.data = data;
    },

    getPanel: function () {
        if (!this.panel) {
            this.panel = Ext.create('Ext.panel.Panel', {
                iconCls: 'sendgrid_icon',
                border: false,
                layout: 'fit',
                items: [
                    this.getChart()
                ],
                dockedItems: this.getDocketItemsForPanel()
            });

            this.filter();
        }

        return this.panel;
    },

    getDocketItemsForPanel: function () {
        return [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: this.getFilterFields()
            }
        ];
    },

    getFilterFields: function () {
        return [
            {
                xtype: 'button',
                text: t('sendgrid_report_day'),
                handler: function () {
                    var today = new Date();
                    var yesterday = new Date();

                    yesterday.setDate(today.getDate() - 1);

                    this.getFromField().setValue(yesterday);
                    this.getToField().setValue(today);

                    this.filter();
                }.bind(this)
            },
            {
                xtype: 'button',
                text: t('sendgrid_report_month'),
                handler: function () {
                    var now = new Date();

                    this.getFromField().setValue(new Date(now.getFullYear(), now.getMonth(), 1));
                    this.getToField().setValue(new Date(now.getFullYear(), now.getMonth() + 1, 0));

                    this.filter();
                }.bind(this)
            },
            {
                xtype: 'button',
                text: t('sendgrid_report_year'),
                handler: function () {
                    var now = new Date();

                    this.getFromField().setValue(new Date(now.getFullYear(), 0, 1));
                    this.getToField().setValue(new Date(now.getFullYear(), 11, 31));

                    this.filter();
                }.bind(this)
            },
            {
                xtype: 'button',
                text: t('sendgrid_report_day_minus'),
                handler: function () {
                    var today = new Date();
                    var yesterday = new Date();

                    today.setDate(today.getDate() - 1);
                    yesterday.setDate(today.getDate() - 1);

                    this.getFromField().setValue(yesterday);
                    this.getToField().setValue(today);

                    this.filter();
                }.bind(this)
            },
            {
                xtype: 'button',
                text: t('sendgrid_report_month_minus'),
                handler: function () {
                    var now = new Date();

                    this.getFromField().setValue(new Date(now.getFullYear(), now.getMonth() - 1, 1));
                    this.getToField().setValue(new Date(now.getFullYear(), now.getMonth(), 0));

                    this.filter();
                }.bind(this)
            },
            {
                xtype: 'button',
                text: t('sendgrid_report_year_minus'),
                handler: function () {
                    var now = new Date();

                    this.getFromField().setValue(new Date(now.getFullYear() - 1, 0, 1));
                    this.getToField().setValue(new Date(now.getFullYear() - 1, 11, 31));

                    this.filter();
                }.bind(this)
            },
            '->',
            {
                xtype: 'combo',
                fieldLabel: t('sendgrid_report_groups'),
                name: 'groupBy',
                value: 'day',
                store: [['day', t('sendgrid_report_groups_day')], ['week', t('sendgrid_report_groups_week')], ['month', t('sendgrid_report_groups_month')]],
                triggerAction: 'all',
                typeAhead: false,
                editable: false,
                forceSelection: true,
                queryMode: 'local',
                listeners: {
                    change: function() {
                        this.filter();
                    }.bind(this)
                }
            },
            {
                xtype: 'datefield',
                fieldLabel: t('sendgrid_report_from'),
                name: 'from',
                value: this.getFromStartDate()
            },
            {
                xtype: 'datefield',
                fieldLabel: t('sendgrid_report_to'),
                name: 'to',
                value: this.getToStartDate()
            },
            {
                xtype: 'button',
                text: t('sendgrid_report_filter'),
                handler: function () {
                    this.filter();
                }.bind(this)
            }
        ];
    },

    filter: function () {
        this.chartStore.load();
    },

    getFromField: function () {
        return this.panel.down('[name=from]');
    },

    getToField: function () {
        return this.panel.down('[name=to]');
    },

    getGroupByField: function () {
        return this.panel.down('[name=groupBy]');
    },

    getFromStartDate: function () {
        var date = new Date();

        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    getToStartDate: function () {
        var date = new Date();

        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },

    getFilterParams: function () {
        return {
            'filters[from]': this.getFromField().getValue().getTime() / 1000,
            'filters[to]': this.getToField().getValue().getTime() / 1000,
            'groupBy': this.getGroupByField().getValue(),
            'document': this.data.id
        };
    },

    getChart: function () {
        if (this.chart) {
            return this.chart;
        }

        var fields = [
            'date',
            'stats'
        ];
        var seriesMeta = [
            {
                field: 'blocks',
                color: '#AA0202'
            },
            {
                field: 'bounce_drops',
                color: '#ff748c'
            },
            {
                field: 'bounces',
                color: '#C042BE'
            },
            {
                field: 'clicks',
                color: '#59C1CA'
            },
            {
                field: 'deferred',
                color: '#30BDA7'
            },
            {
                field: 'delivered',
                color: '#BCD514'
            },
            {
                field: 'invalid_emails',
                color: '#6B6B6B'
            },
            {
                field: 'opens',
                color: '#028690'
            },
            {
                field: 'processed',
                color: '#30BDA7'
            },
            {
                field: 'requests',
                color: '#30BDA7'
            },
            {
                field: 'spam_report_drops',
                color: '#D59F7F'
            },
            {
                field: 'spam_reports',
                color: '#E04427'
            },
            {
                field: 'unique_clicks',
                color: '#BCD0D1'
            },
            {
                field: 'unique_opens',
                color: '#FBE500'
            },
            {
                field: 'unsubscribe_drops',
                color: '#6DC2F9'
            },
            {
                field: 'unsubscribes',
                color: '#3E44C0'
            }
        ];

        var series = [];

        Ext.each(seriesMeta, function (meta) {
            series.push({
                type: 'line',
                style: {
                    stroke: meta.color,
                    lineWidth: 2
                },
                marker: {
                    radius: 4
                },
                label: {
                    field: meta.field,
                    display: 'over'
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    trackMouse: true,
                    showDelay: 0,
                    dismissDelay: 0,
                    hideDelay: 0,
                    renderer: function (tooltip, record, item) {
                        tooltip.setHtml(record.get('date') + ' (' + meta.field + '): ' + record.get(meta.field));
                    },
                },
                xField: 'date',
                yField: meta.field
            });

            fields.push({
                name: meta.field,
                mapping: function (data) {
                    return data.stats[0].metrics[meta.field]
                }
            })
        });

        this.chartStore = new Ext.data.Store({
            fields: fields,
            proxy: {
                type: 'ajax',
                url: '/plugin/SendGrid/admin_category/stats',
                actionMethods: {
                    read: 'GET'
                },
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total'
                }
            }
        });

        this.chartStore.on('beforeload', function (store, operation) {
            store.getProxy().setExtraParams(this.getFilterParams());
        }.bind(this));

        this.chart = Ext.create({
            xtype: 'cartesian',
            width: 600,
            height: 400,
            insetPadding: 40,
            store: this.chartStore,
            axes: [{
                type: 'numeric',
                position: 'left',
                fields: seriesMeta.map(function (meta) {
                    return meta.field;
                }),
                title: {
                    text: '',
                    fontSize: 15
                },
                grid: true
            }, {
                type: 'category',
                position: 'bottom',
                fields: 'date',
                title: {
                    text: 'Dates',
                    fontSize: 15
                }
            }],
            series: series
        });

        return this.chart;
    }
});
