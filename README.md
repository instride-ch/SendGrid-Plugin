# Pimcore 4 SendGrid Plugin

## Installation
Install Plugin by copying it into the plugins directory. After that execute following command:

```composer require sendgrid/sendgrid```

## Configuration
SendGrid Plugins allows you to configure SendGrid for a multi-site setup. So, start configuring it in "Settings" -> "SendGrid"

## Reports
The Plugin comes with 3 reports:

 - Bounces
 - Blocks
 - Spams

This reports allow you to delete mails caught into one of those lists.

## SendGrid SMTP API
The Plugin sends additional Information to SendGrid using the SMTP API. This data includes:

 - SendGrid Category = DocumentId
 - Custom Args:
      - Newsletter Class Name if applicable

## SendGrid Event Hook
If configured, the plugin intercepts SendGrid Events and adds notes to the according Pimcore Class. The Plugin also triggers
an event which can be intercepted inside your application.

Events:
    - sendgrid.event: Generic Event which is fired each time sendgrid sends an event
    - sendgri.%eventName%: Event for a specific send grid event like blocked our bounced [SendGrid Event API](https://sendgrid.com/docs/API_Reference/Webhooks/event.html#-Event-Types)