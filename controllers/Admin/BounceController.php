<?php

class SendGrid_Admin_BounceController extends \SendGrid\Controller\AbstractSuppressionController
{
    protected function getType()
    {
        return 'bounces';
    }
}
