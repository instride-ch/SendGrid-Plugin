<?php

namespace SendGrid;

use SendGrid\Model\Configuration;

class Version
{
    /**
     * @return array
     */
    protected static function getPluginConfig()
    {
        return Configuration::getPluginConfig()->plugin;
    }

    /**
     * @return string
     */
    public static function getVersion()
    {
        return self::getPluginConfig()->pluginVersion;
    }

    /**
     * @return int
     */
    public static function getBuild()
    {
        return self::getPluginConfig()->pluginRevision;
    }
}
