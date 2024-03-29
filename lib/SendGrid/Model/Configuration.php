<?php

namespace SendGrid\Model;

use Pimcore\Logger;
use Pimcore\Model\AbstractModel;
use Pimcore\Tool;

class Configuration extends AbstractModel
{
    /**
     * @var int
     */
    public $id;

    /**
     * @var string
     */
    public $key;

    /**
     * @var string
     */
    public $data;

    /**
     * @var int
     */
    public $creationDate;

    /**
     * @var int
     */
    public $modificationDate;

    /**
     * this is a small per request cache to know which configuration is which is, this info is used in self::getByKey().
     *
     * @var array
     */
    protected static $nameIdMappingCache = array();

    /**
     * Get By Id.
     *
     * @param int $id
     *
     * @return Configuration
     */
    public static function getById($id)
    {
        $cacheKey = 'sendgrid_configuration_'.$id;

        try {
            $configurationEntry = \Zend_Registry::get($cacheKey);
            if (!$configurationEntry) {
                throw new \Exception('Configuration in registry is null');
            }
        } catch (\Exception $e) {
            try {
                $configurationEntry = new self();
                \Zend_Registry::set($cacheKey, $configurationEntry);
                $configurationEntry->setId(intval($id));
                $configurationEntry->getDao()->getById();
            } catch (\Exception $e) {
                Logger::error($e);

                return null;
            }
        }

        return $configurationEntry;
    }

    /**
     * Get by Key.
     *
     * @param string $key
     * @param bool   $returnObject
     *
     * @return mixed|null
     */
    public static function get($key, $returnObject = false)
    {
        $cacheKey = $key;

        // check if pimcore already knows the id for this $name, if yes just return it
        if (array_key_exists($cacheKey, self::$nameIdMappingCache)) {
            $entry = self::getById(self::$nameIdMappingCache[$cacheKey]);

            if ($returnObject) {
                return $entry;
            }

            return $entry instanceof self ? $entry->getData() : null;
        }

        // create a tmp object to obtain the id
        $configurationEntry = new self();

        try {
            $configurationEntry->getDao()->getByKey($key);
        } catch (\Exception $e) {
            return null; //return silently.
        }

        // to have a singleton in a way. like all instances of Element\ElementInterface do also, like Object\AbstractObject
        if ($configurationEntry->getId() > 0) {
            // add it to the mini-per request cache
            self::$nameIdMappingCache[$cacheKey] = $configurationEntry->getId();
            $entry = self::getById($configurationEntry->getId());

            if ($returnObject) {
                return $entry;
            }

            return $entry instanceof self ? $entry->getData() : null;
        }
    }

    /**
     * set data for key.
     *
     * @param $key
     * @param $data
     */
    public static function set($key, $data)
    {
        $configEntry = self::get($key, true);

        if (!$configEntry) {
            $configEntry = new self();
            $configEntry->setKey($key);
        }

        $configEntry->setData($data);
        $configEntry->save();
    }

    /**
     * Remove all values from key
     *
     * @param $key
     */
    public static function remove($key)
    {
        $list = new Configuration\Listing();
        $list->setFilter(function ($row) use ($key) {
            if ($row['key'] == $key) {
                return true;
            }

            return false;
        });

        foreach ($list->getConfigurations() as $config) {
            $config->delete();
        }
    }


    /**
     * get Plugin Config.
     *
     * @return mixed|null|\Zend_Config_Xml
     *
     * @throws \Zend_Exception
     */
    public static function getPluginConfig()
    {
        $config = null;

        if (\Zend_Registry::isRegistered('sendgrid_plugin_config')) {
            $config = \Zend_Registry::get('sendgrid_plugin_config');
        } else {
            try {
                $config = new \Zend_Config_Xml(PIMCORE_PLUGINS_PATH . '/SendGrid/plugin.xml');
                self::setPluginConfig($config);
            } catch (\Exception $e) {
                if (is_file(PIMCORE_PLUGINS_PATH . '/SendGrid/plugin.xml')) {
                    $m = 'Your plugin_xml.xml located at '.PIMCORE_PLUGINS_PATH . '/SendGrid/plugin.xml'.' is invalid, please check and correct it manually!';
                    Tool::exitWithError($m);
                }
            }
        }

        return $config;
    }

    /**
     * Set Plugin Config to \Zend_Registry.
     *
     * @static
     *
     * @param \Zend_Config $config
     */
    public static function setPluginConfig(\Zend_Config $config)
    {
        \Zend_Registry::set('sendgrid_plugin_config', $config);
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * @param string $key
     */
    public function setKey($key)
    {
        $this->key = $key;
    }

    /**
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @param string $data
     */
    public function setData($data)
    {
        $this->data = $data;
    }

    /**
     * @return int
     */
    public function getCreationDate()
    {
        return $this->creationDate;
    }

    /**
     * @param int $creationDate
     */
    public function setCreationDate($creationDate)
    {
        $this->creationDate = $creationDate;
    }

    /**
     * @return int
     */
    public function getModificationDate()
    {
        return $this->modificationDate;
    }

    /**
     * @param int $modificationDate
     */
    public function setModificationDate($modificationDate)
    {
        $this->modificationDate = $modificationDate;
    }
}
