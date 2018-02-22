<?php

namespace SendGrid\EventListener;

use Pimcore\Mail;
use Pimcore\Model\Document\Newsletter;
use Pimcore\Model\Tool\Admin\EventDataContainer;
use SendGrid\Service\TransportGuesser;

class MailTransportListener
{
    /**
     * @var TransportGuesser
     */
    private $transportGuesser;

    public function __construct()
    {
        $this->transportGuesser = new TransportGuesser();
    }

    public function onMailSend(\Zend_EventManager_Event $event)
    {
        $mail = $event->getTarget();
        $container = $event->getParams();

        if (!$mail instanceof Mail) {
            return;
        }

        if (!$container instanceof EventDataContainer) {
            return;
        }

        $document = $mail->getDocument();

        if (!$document instanceof Newsletter) {
            return;
        }

        $transport = $this->transportGuesser->getTransportForMail($mail);

        if (!$transport instanceof \Zend_Mail_Transport_Smtp) {
            return;
        }

        $container->setData(['transport' => $transport]);

        $event->setParams($container);
    }
}