<?php

class SendGrid_Admin_SpamController extends \SendGrid\Controller\AbstractSuppressionController
{
    protected function getType()
    {
        return 'spam';
    }
}
