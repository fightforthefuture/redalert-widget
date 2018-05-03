# Red Alert for Net Neutrality Widget

This is the source code for Battle for the Net's Red Alert for Net Neutrality widget. On May 9th, we're going to take back net neutrality. [Click here to learn more.](https://www.battleforthenet.com/redalert/)

## How to install the widget on your site

Add this one line of JavaScript to any page, and you're good to go: ([**See the demo!**](https://www.fightforthefuture.org?redalert))

```html
<script src="https://redalert.battleforthenet.com/widget.js" async></script>
```

You can change the positioning and do some customization via the `RED_ALERT_OPTIONS` [described below](#customization).

If you have any problems or questions regarding the widget, please [submit an issue](https://github.com/fightforthefuture/redalert-widget/issues).


## How it works

On May 9th, the widget will cover your homepage with an unavoidable message that informs visitors about the impending vote and provides them with the opportunity to take action.

![A screenshot of our Red Alert modal](https://www.battleforthenet.com/images/redalert/modal-preview.jpg)

Between May 9th and the vote (date TBD), the widget will display at a smaller size, continuing to drive calls and emails to lawmakers without distracting users from your site.

![A screenshot of our Red Alert modal when minimized](https://www.battleforthenet.com/images/redalert/modal-minimized-preview.jpg)

Starting at midnight, the night before the vote, the widget will expand again.  Try it out for yourself [right here](https://www.fightforthefuture.org?redalert).

The widget is designed to appear once per user, per device, per day, but can be configured to display at a different interval. If you'd like to force it to show up on your page for testing, reload the page with `#ALWAYS_SHOW_BFTN_WIDGET` at the end of the URL.

Please take a look at [**widget.js**](https://github.com/fightforthefuture/redalert-widget/blob/master/static/widget.js) if you want to see exactly what you're embedding on your page.

The widget is compatible with Firefox, Chrome (desktop and mobile), Safari (desktop and mobile), Microsoft Edge, and Internet Explorer 11.

## Customization options

If you define an object called `RED_ALERT_OPTIONS` before including the widget code, you can pass some properties in to customize the default behavior.

```html
<script type="text/javascript">
  var RED_ALERT_OPTIONS = {
    /**
     * Sets the position of the widget on the page. Can be 'left' or 'right'.
     * Defaults to 'right'.
     */
    position: 'right', // @type {string}

    /**
     * Set this to true to disable loading the full screen widget by default on
     * May 9th. Defaults to false.
     */
    cowardlyRefuseToMaximize: false, // @type {boolean}

    /*
     * Choose from 'fp' for Free Press, 'dp' for Demand Progress or
     * 'fftf' for Fight for the Future. Omit this property to randomly split
     * form submissions between all organizations in the Battle for the Net 
     * coalition. Defaults to null.
     */
    org: null, // @type {string}

    /*
     * Specify view cookie expiration. After initial view, modal will not be
     * displayed to a user again until after this cookie expires. Defaults to 
     * one day.
     */
    cookieExpirationDays: 1, // @type {number}

    /*
     * Prevents the widget iframe from loading Google Analytics. Defaults to 
     * false. (Google Analytics will also be disabled if doNotTrack is set on
     * the user's browser.)
     */
    disableGoogleAnalytics: false, // @type {boolean}
    
    /*
     * Always show the widget. Useful for testing. Defaults to false.
     */
    alwaysShow: false // @type {boolean}
  };
</script>
<script src="https://widget.battleforthenet.com/widget.js" async></script>
```
