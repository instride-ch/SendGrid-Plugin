<?php

namespace SendGrid\Model\Configuration;

use SendGrid\Model\Configuration;
use Pimcore\Model;

class Listing extends Model\Listing\JsonListing
{
    /**
     * Contains the results of the list. They are all an instance of Configuration.
     *
     * @var array
     */
    public $configurations = null;

    /**
     * Get Configurations.
     *
     * @return Configuration[]
     */
    public function getConfigurations()
    {
        if (is_null($this->configurations)) {
            $this->load();
        }

        return $this->configurations;
    }

    /**
     * Set Configuration.
     *
     * @param array $configurations
     */
    public function setConfigurations($configurations)
    {
        $this->configurations = $configurations;
    }
}
