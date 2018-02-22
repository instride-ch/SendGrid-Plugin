<?php

namespace SendGrid;

use Pimcore\API\Plugin as PluginLib;
use Pimcore\Model\Site;
use SendGrid\EventListener\MailTransportListener;
use SendGrid\Model\Configuration;

class Plugin extends PluginLib\AbstractPlugin implements PluginLib\PluginInterface
{
    private static $_translate;

    public function init()
    {
        parent::init();

        \Pimcore::getEventManager()->attach('mail.preSend', function (\Zend_EventManager_Event $e) {
            $listener = new MailTransportListener();
            $listener->onMailSend($e);
        });
    }

    public static function getSendGridApi($siteId)
    {
        return new \SendGrid(Configuration::get("APPLICATION.MULTISITE." . $siteId . ".API_KEY"));
    }

    public static function install()
    {
        Model\Configuration::set("INSTALLED", true);
        Model\Configuration::set("INSTALLED_VERSION", Version::getBuild());

        return true;
    }

    /**
     * uninstall plugin
     *
     * @return bool true
     */
    public static function uninstall()
    {
        return true;
    }

    /**
     * plugin isInstalled
     *
     * @return bool true
     */
    public static function isInstalled()
    {
        $versionInstalled = Model\Configuration::get("INSTALLED_VERSION");

        if (!$versionInstalled || $versionInstalled < Version::getBuild()) {
            return false;
        }

        return true;
    }

    /**
     * get translation directory
     *
     * @return string
     */
    public static function getTranslationFileDirectory()
    {
        return PIMCORE_PLUGINS_PATH . '/SendGrid/static/texts';
    }

    /**
     * get translation file
     *
     * @param string $language
     * @return string path to the translation file relative to plugin directory
     */
    public static function getTranslationFile($language)
    {
        if (is_file(self::getTranslationFileDirectory() . "/$language.csv")) {
            return "/SendGrid/static/texts/$language.csv";
        } else {
            return '/SendGrid/static/texts/en.csv';
        }
    }

    /**
     * get translate
     *
     * @param $lang
     * @return \Zend_Translate
     */
    public static function getTranslate($lang = null)
    {
        if (self::$_translate instanceof \Zend_Translate) {
            return self::$_translate;
        }
        if (is_null($lang)) {
            try {
                $lang = \Zend_Registry::get('Zend_Locale')->getLanguage();
            } catch (\Exception $e) {
                $lang = 'en';
            }
        }

        self::$_translate = new \Zend_Translate(
            'csv',
            PIMCORE_PLUGINS_PATH . self::getTranslationFile($lang),
            $lang,
            ['delimiter' => ',']
        );

        return self::$_translate;
    }
}
