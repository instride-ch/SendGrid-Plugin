<?php

class SendGrid_Api_EventController extends \Pimcore\Controller\Action
{
    public function eventAction()
    {
        $request = $this->getRequest();

        $body = $request->getRawBody();

        if ($body) {
            $json = json_decode($body, true);

            if (json_last_error() == JSON_ERROR_NONE) {
                foreach ($json as $mail) {
                    $validateKeys = [
                        'email',
                        'class',
                        'category',
                        'event'
                    ];

                    foreach ($validateKeys as $key) {
                        if (!array_key_exists($key, $mail)) {
                            continue 2;
                        }
                    }

                    $classDefinition = \Pimcore\Model\Object\ClassDefinition::getByName($mail['class']);
                    $fqcn = 'Pimcore\\Model\\Object\\' . $mail['class'];

                    if (!$classDefinition instanceof \Pimcore\Model\Object\ClassDefinition) {
                        continue;
                    }

                    $list = $fqcn::getList();
                    $list->setCondition('email = ?', $mail['email']);
                    $list->load();

                    if (count($list->getObjects()) === 0 || count($list->getObjects()) > 1) {
                        continue;
                    }

                    $object = reset($list->getObjects());

                    $note = new \Pimcore\Model\Element\Note();
                    $note->setElement($object);
                    $note->setDate(time());
                    $note->setType(sprintf('sendgrid_%s', $mail['event']));
                    $note->setTitle(sprintf('SendGrid Event: %s', $mail['event']));
                    $note->setUser(0);

                    foreach ($mail as $key=>$value) {
                        $note->addData($key, "text", $value);
                    }

                    $note->save();

                    \Pimcore::getEventManager()->trigger(sprintf('sendgrid.%s', $mail['event']), $object, [$mail]);
                    \Pimcore::getEventManager()->trigger(sprintf('sendgrid.event', $mail['event']), $object, [$mail]);
                }
            }
        }

        exit;
    }
}
