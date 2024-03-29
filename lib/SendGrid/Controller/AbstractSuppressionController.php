<?php

namespace SendGrid\Controller;

abstract class AbstractSuppressionController extends \Pimcore\Controller\Action\Admin
{
    protected abstract function getType();

    public function getAction()
    {
        $siteId = (int) $this->getParam('site');
        $sg = \SendGrid\Plugin::getSendGridApi($siteId);

        $query_params = [];

        $response = $sg->client->suppression()->{$this->getType()}()->get(null, $query_params);

        if ($response->statusCode() === 200) {
            $body = $response->body();
            $json = json_decode($body, true);

            if (json_last_error() == JSON_ERROR_NONE) {
                $this->_helper->json([
                    'success' => true,
                    'data' => $json
                ]);
                return;
            }
        }

        $this->_helper->json(['success' => false]);
    }

    public function deleteAction()
    {
        $siteId = (int)$this->getParam('site');
        $email = $this->getParam('email');

        if ($this->removeSuppression($siteId, [$email])) {
            $this->_helper->json(['success' => true]);
            return;
        }

        $this->_helper->json(['success' => false]);
    }

    public function deleteAllAction()
    {
        $siteId = (int)$this->getParam('site');

        if ($this->removeSuppression($siteId)) {
            $this->_helper->json(['success' => true]);
            return;
        }

        $this->_helper->json(['success' => false]);
    }

    protected function removeSuppression($siteId, $emails = [])
    {
        $query_params = [
            'emails' => $emails
        ];

        if (count($emails) === 0) {
            $query_params = [
                'delete_all' => true
            ];
        }

        $sg = \SendGrid\Plugin::getSendGridApi($siteId);
        $response = $sg->client->suppression()->{$this->getType()}()->delete($query_params);

        if ($response->statusCode() === 204) {
            return true;
        }

        return false;
    }
}
