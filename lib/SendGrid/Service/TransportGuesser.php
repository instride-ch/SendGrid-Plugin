<?php

namespace SendGrid\Service;

use Pimcore\Logger;
use Pimcore\Mail;
use Pimcore\Model;
use SendGrid\Document\SiteResolver;
use SendGrid\Model\Configuration;

class TransportGuesser
{
    /**
     * @var SiteResolver
     */
    private $siteResolver;

    public function __construct()
    {
        $this->siteResolver = new SiteResolver();
    }

    public function getTransportForMail(Mail $mail)
    {
        $document = $mail->getDocument();

        $site = $this->siteResolver->getSiteForDocument($document);
        $siteId = 0;

        if ($site instanceof Model\Site) {
            $siteId = $site->getId();
        }

        $config = [];

        $configPrefix = "APPLICATION.MULTISITE.$siteId";
        $active = Configuration::get("$configPrefix.SMTP.ACTIVE");
        $name = Configuration::get("$configPrefix.SMTP.NAME");
        $ssl = Configuration::get("$configPrefix.SMTP.SSL");
        $port = Configuration::get("$configPrefix.SMTP.PORT");
        $host = Configuration::get("$configPrefix.SMTP.HOST");
        $method = Configuration::get("$configPrefix.SMTP.AUTH.METHOD");
        $username = Configuration::get("$configPrefix.SMTP.AUTH.USERNAME");
        $password = Configuration::get("$configPrefix.SMTP.AUTH.PASSWORD");

        if ($active && $host) {
            if ($name) {
                $config['name'] = $name;
            }
            if ($ssl) {
                $config['ssl'] = $ssl;
            }
            if ($port) {
                $config['port'] = $port;
            }
            if ($method) {
                $config['auth'] = $method;
                $config['username'] = $username;
                $config['password'] = $password;
            }

            if ($mail->getDocument() instanceof Model\Document) {
                $sendGridData = [
                    'category' => $mail->getDocument()->getId(),
                    'personalizations' => [
                        'custom_args' => [
                            'siteId' => $siteId
                        ]
                    ]
                ];

                $objectParam = $mail->getParam('object');

                if ($objectParam instanceof Model\Object\Concrete) {
                    $sendGridData['personalizations']['custom_args']['class'] = $objectParam->getClass()->getName();
                }

                $mail->addHeader('X-SMTPAPI', json_encode($sendGridData));
            }

            Logger::info("Got Transport for Multi SMTP: " . $name . ", " . $username);

            return new \Zend_Mail_Transport_Smtp($host, $config);
        }

        return null;
    }
}
