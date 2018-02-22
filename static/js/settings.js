pimcore.registerNS('pimcore.plugin.sendgrid.settings');
pimcore.plugin.sendgrid.settings = Class.create({

    shopPanels: {},

    initialize: function () {
        this.getData();
    },

    getData: function () {
        Ext.Ajax.request({
            url: '/plugin/SendGrid/admin_settings/get',
            success: function (response) {

                this.data = Ext.decode(response.responseText);

                this.getTabPanel();

            }.bind(this),
        });
    },

    getValue: function (key) {
        var current = null;

        if (this.data.settings.hasOwnProperty(key)) {
            current = this.data.settings[key];
        }

        if (typeof current != 'object' && typeof current != 'array' && typeof current != 'function') {
            return current;
        }

        return '';
    },

    getTabPanel: function () {
        if (!this.panel) {
            var me = this;

            this.panel = Ext.create('Ext.panel.Panel', {
                id: 'sendgrid_settings',
                title: t('sendgrid_settings'),
                iconCls: 'sendgrid_icon',
                border: false,
                layout: 'fit',
                closable: true,
            });

            var tabPanel = Ext.getCmp('pimcore_panel_tabs');
            tabPanel.add(this.panel);
            tabPanel.setActiveItem('sendgrid_settings');

            this.panel.on('destroy', function () {
                pimcore.globalmanager.remove('sendgrid_settings');
            }.bind(this));

            this.layout = Ext.create('Ext.panel.Panel', {
                bodyStyle: 'padding:20px 5px 20px 5px;',
                border: false,
                autoScroll: true,
                forceLayout: true,
                defaults: {
                    forceLayout: true,
                },
                buttons: [
                    {
                        text: t('save'),
                        handler: this.save.bind(this),
                        iconCls: 'pimcore_icon_apply',
                    },
                ],
            });

            this.settingsPanel = Ext.create('Ext.form.Panel', {
                border: false,
                autoScroll: true,
                forceLayout: true,
                defaults: {
                    forceLayout: true,
                },
                fieldDefaults: {
                    labelWidth: 250,
                },
                items: [
                    this.getMulitSiteSmtpSettings()
                ],
            });

            this.layout.add(this.settingsPanel);

            this.panel.add(this.layout);

            pimcore.layout.refresh();
        }

        return this.panel;
    },

    getMulitSiteSmtpSettings: function () {
        var me = this;
        var tabPanel = Ext.create({
            xtype: 'tabpanel'
        });
        var fieldset = Ext.create({
            xtype: 'fieldset',
            layout: 'fit',
            title: t('sendgrid_settings_multi_site_smtp'),
            autoHeight: true,
            items: [tabPanel]
        });

        pimcore.globalmanager.get('sites').load(function() {
            var sites = pimcore.globalmanager.get('sites').getRange();
            sites.unshift({
                data: {
                    id: 0,
                    domain: 'main'
                }
            });

            Ext.each(sites, function (site) {
                var siteId = site.data.id;

                if (siteId === "default") {
                    return;
                }

                tabPanel.add({
                    title: site.data.domain,
                    layout: 'form',
                    defaultType: 'textfield',
                    defaults: {width: 600},
                    items: [
                        {
                            xtype: 'checkbox',
                            fieldLabel: t("active"),
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.ACTIVE",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.ACTIVE")
                        },
                        {
                            fieldLabel: t("sendgrid_api_key"),
                            name: "APPLICATION.MULTISITE." + siteId + ".API_KEY",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".API_KEY")
                        },
                        {
                            fieldLabel: t("email_smtp_host"),
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.HOST",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.HOST")
                        },
                        {
                            fieldLabel: t("email_smtp_ssl"),
                            xtype: "combo",
                            width: 425,
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.SSL",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.SSL"),
                            store: [
                                ["", t('no_ssl')],
                                ["tls", "TLS"],
                                ["ssl", "SSL"]
                            ],
                            mode: "local",
                            editable: false,
                            forceSelection: true,
                            triggerAction: "all"
                        },
                        {
                            fieldLabel: t("email_smtp_port"),
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.PORT",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.PORT")
                        },
                        {
                            fieldLabel: t("email_smtp_name"),
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.NAME",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.NAME")
                        },
                        {
                            fieldLabel: t("email_smtp_auth_method"),
                            xtype: "combo",
                            width: 425,
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.METHOD",
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.METHOD"),
                            store: [
                                ["", t('no_authentication')],
                                ["login", "LOGIN"],
                                ["plain", "PLAIN"],
                                ["crammd5", "CRAM-MD5"]
                            ],
                            mode: "local",
                            editable: false,
                            forceSelection: true,
                            triggerAction: "all",
                            listeners: {
                                select: me.smtpAuthSelected.bind(this, "email" + siteId)
                            }
                        },
                        {
                            fieldLabel: t("email_smtp_auth_username"),
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.USERNAME",
                            itemId: "email" + siteId + "_username",
                            hidden: (me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.USERNAME").length > 1) ? false : true,
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.USERNAME")
                        },
                        {
                            fieldLabel: t("email_smtp_auth_password"),
                            name: "APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.PASSWORD",
                            inputType: "password",
                            itemId: "email" + siteId + "_password",
                            hidden: (me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.PASSWORD").length > 1) ? false : true,
                            value: me.getValue("APPLICATION.MULTISITE." + siteId + ".SMTP.AUTH.PASSWORD")
                        }
                    ]
                });
            });


            if (pimcore.globalmanager.get('sites').getRange().length > 0) {
                tabPanel.setActiveItem(0);
            }
        });

        return fieldset;
    },

    smtpAuthSelected: function (type, combo) {

        var username = combo.ownerCt.getComponent(type + "_username");
        var pass = combo.ownerCt.getComponent(type + "_password");

        if (!combo.getValue()) {
            username.hide();
            pass.hide();
            username.setValue("");
            pass.setValue("");
        } else {
            username.show();
            pass.show();
        }
    },

    activate: function () {
        var tabPanel = Ext.getCmp('pimcore_panel_tabs');
        tabPanel.setActiveItem('sendgrid_settings');
    },

    save: function () {
        var data = this.settingsPanel.getForm().getFieldValues();

        Ext.Ajax.request({
            url: '/plugin/SendGrid/admin_settings/set',
            method: 'post',
            params: {
                settings: Ext.encode(data),
            },
            success: function (response) {
                try {
                    var res = Ext.decode(response.responseText);
                    if (res.success) {
                        pimcore.helpers.showNotification(t('success'), t('success'), 'success');
                    } else {
                        pimcore.helpers.showNotification(t('error'), t('error'),
                            'error', t(res.message));
                    }
                } catch (e) {
                    pimcore.helpers.showNotification(t('error'), t('error'), 'error');
                }
            },
        });
    },
});
