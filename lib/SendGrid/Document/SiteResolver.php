<?php

namespace SendGrid\Document;

use Pimcore\Model;

class SiteResolver
{
    /**
     * @param Model\Document $document
     * @return null|Model\Site
     */
    public function getSiteForDocument(Model\Document $document)
    {
        if ($document instanceof Model\Document) {
            do {
                try {
                    $site = Model\Site::getByRootId($document->getId());

                    if ($site instanceof Model\Site) {
                        return $site;
                    }
                } catch (\Exception $x) {

                }

                $document = $document->getParent();
            } while ($document instanceof Model\Document);
        }

        return null;
    }
}