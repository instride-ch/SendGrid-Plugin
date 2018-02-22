<?php

class SendGrid_Admin_SettingsController extends \Pimcore\Controller\Action\Admin
{
    public function getAction()
    {
        $valueArray = [];

        $config = new \SendGrid\Model\Configuration\Listing();

        foreach ($config->getConfigurations() as $c) {
            $valueArray[$c->getKey()] = $c->getData();
        }

        $response = array(
            'settings' => $valueArray
        );

        $this->_helper->json($response);
        $this->_helper->json(false);
    }

    public function setAction()
    {
        $values = \Zend_Json::decode($this->getParam('settings'));
        $values = array_htmlspecialchars($values);

        foreach ($values as $key => $value) {
            \SendGrid\Model\Configuration::set($key, $value);
        }

        $this->_helper->json(array('success' => true));
    }

    public function sitesAction()
    {
        $docIds = [
            0 => 1
        ];
        $allowedSites = [];
        $siteNames = [
            0 => "main"
        ];

        $sites = new \Pimcore\Model\Site\Listing();
        $sites->load();
        $sites = $sites->getSites();

        /**
         * @var $site \Pimcore\Model\Site
         */
        foreach ($sites as $site) {
            $docIds[$site->getId()] = $site->getRootId();
            $siteNames[$site->getId()] = $site->getMainDomain();
        }

        foreach ($docIds as $siteId => $docId) {
            $key = "APPLICATION.MULTISITE.$siteId.SMTP.ACTIVE";
            $active = \SendGrid\Model\Configuration::get($key);

            if (!$active) {
                continue;
            }

            $doc = \Pimcore\Model\Document::getById($docId);

            if ($doc instanceof \Pimcore\Model\Document && $doc->isAllowed("view")) {
                $allowedSites[] = [
                    "id" => $siteId,
                    "name" => $siteNames[$siteId]
                ];
            }
        }

        $this->_helper->json($allowedSites);
    }
}
