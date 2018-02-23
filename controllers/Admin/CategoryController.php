<?php

class SendGrid_Admin_CategoryController extends \Pimcore\Controller\Action\Admin
{
    public function isConfiguredAction()
    {
        $documentId = $this->getParam('document');
        $siteResolver = new \SendGrid\Document\SiteResolver();
        $newsletterDocument = \Pimcore\Model\Document\Newsletter::getById($documentId);

        if (!$newsletterDocument) {
            $this->_helper->json(['success' => false]);
            return;
        }

        $site = $siteResolver->getSiteForDocument($newsletterDocument);
        $siteId = 0;

        if ($site instanceof \Pimcore\Model\Site) {
            $siteId = $site->getId();
        }

        $sg = \SendGrid\Plugin::getSendGridApi($siteId);

        $this->_helper->json(['success' => $sg instanceof SendGrid]);
    }

    public function statsAction()
    {
        $siteResolver = new \SendGrid\Document\SiteResolver();
        $documentId = $this->getParam('document');
        $filters = $this->getParam('filters', ['from' => date('01-m-Y'), 'to' => date('m-t-Y')]);
        $groupBy = $this->getParam('groupBy', 'day');

        $from = new \Pimcore\Date($filters['from']);
        $to = new \Pimcore\Date($filters['to']);

        $newsletterDocument = \Pimcore\Model\Document\Newsletter::getById($documentId);

        if (!$newsletterDocument) {
            $this->_helper->json(['success' => false]);
            return;
        }

        $query_params = [
            'categories' => $newsletterDocument->getId(),
            'start_date' => date('Y-m-d', $from->getTimestamp()),
            'end_date' => date('Y-m-d', $to->getTimestamp()),
            'aggregated_by' => $groupBy,
        ];

        $site = $siteResolver->getSiteForDocument($newsletterDocument);
        $siteId = 0;

        if ($site instanceof \Pimcore\Model\Site) {
            $siteId = $site->getId();
        }

        $sg = \SendGrid\Plugin::getSendGridApi($siteId);
        $response = $sg->client->categories()->stats()->get(null, $query_params);

        if ($response->statusCode() === 200) {
            $body = $response->body();
            $json = json_decode($body, true);

            if (json_last_error() == JSON_ERROR_NONE) {
                $this->_helper->json([
                    'success' => true,
                    'total' => count($json),
                    'data' => $json
                ]);
                return;
            }
        }

        $this->_helper->json(['success' => false]);
    }
}
