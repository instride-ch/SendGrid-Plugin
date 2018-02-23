<?php

class SendGrid_Admin_BlockController extends \SendGrid\Controller\AbstractSuppressionController
{
    protected function getType()
    {
        return 'blocks';
    }
}
