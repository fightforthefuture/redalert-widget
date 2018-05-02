require('./app.scss')

document.addEventListener('DOMContentLoaded', function() {
  function getEl(id) {
    return document.getElementById(id);
  }

  function attachEvent(sel, event, callback) {
    var elements = document.querySelectorAll(sel);
    for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener(event, callback);
    }
  }

  function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  }

  // fp = 20%, dp = 40%, fftf = 40%
  function getRandomOrg() {
    var coinToss = Math.random();
    if (coinToss < .20) {
      return 'fp';
    }
    else if (coinToss < .60) {
      return 'dp';
    }
    else {
      return 'fftf';
    }
  }

  function initGoogleAnalytics(page) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    if (typeof ga !== 'undefined') {
      ga('create', 'UA-26576645-40', 'auto');

      if (page) {
        ga('set', 'page', page);
      }

      ga('send', 'pageview');
    }
  }

  function addTrackingEvents() {
    attachEvent('.btn-facebook', 'click', () => trackEvent('facebook_button', 'click'))
    attachEvent('.btn-twitter', 'click', () => trackEvent('twitter_button', 'click'))
    attachEvent('.btn-donate', 'click', () => trackEvent('donate_button', 'click'))
    attachEvent('.email-form', 'submit', () => trackEvent('email_form', 'submit'))
    attachEvent('.call-form', 'submit', () => trackEvent('call_form', 'submit'))
    attachEvent('.minimized .close', 'click', () => trackEvent('minimized_close_button', 'click'))
    attachEvent('.minimized .btn', 'click', event => {
      trackEvent('minimized_cta_button', 'click', event.currentTarget.innerHTML)
    })
  }

  // send event to Google Analytics
  function trackEvent(category, action, label, value) {
    if (!window.ga) return

    const params = {
      hitType: 'event',
      eventCategory: category,
      eventAction: action
    }

    if (label) {
      params.eventLabel = label
    }

    if (value) {
      params.eventValue = value
    }

    window.ga('send', params)
  }

  function showStep(step) {
    document.body.setAttribute('data-step', step)
  }
  // window.showStep = showStep

  // TODO: error handling
  function submitForm(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const xhr = new XMLHttpRequest()

    xhr.addEventListener('error', console.error)
    xhr.addEventListener('load', event => {
      form.removeAttribute('data-loading')

      const nextStep = parseInt(document.body.getAttribute('data-step')) + 1
      if (document.querySelectorAll(`.step[data-step="${nextStep}"]`).length > 0) {
        showStep(nextStep)
      }
    })

    form.setAttribute('data-loading', true)
    xhr.open(form.getAttribute('method'), form.getAttribute('action'))
    xhr.send(formData)
  }

  function postMessage(action, data) {
    data || (data = {})
    data.action = action
    data.RED_ALERT = true
    window.parent.postMessage(data, '*')
  }

  function closeWindow(event) {
    event.preventDefault()
    event.stopPropagation()
    postMessage('closeWindow')
  }

  let isMaximizing = false

  function maximize(event) {
    if (isMaximizing) return
    isMaximizing = true
    trackEvent('widget', 'maximized')
    postMessage('maximize')
    const el = document.querySelector('.minimized')
    el.classList.add('fade-out')
    setTimeout(() => {
      document.body.setAttribute('data-minimized', false)
      isMaximizing = false
    }, 200)
  }

  function todayIs(y, m, d) {
    const date = new Date()
    const offset = 4 // EDT
    date.setHours(date.getHours() + date.getTimezoneOffset()/60 - offset)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return (year === y && month === m && day === d)
  }

  // bind events
  attachEvent('form', 'submit', submitForm)
  attachEvent('.minimized', 'click', maximize)
  attachEvent('.minimized', 'touchstart', maximize)
  attachEvent('.close', 'click', closeWindow)
  attachEvent('.close', 'touchstart', e => e.stopPropagation())

  const query = parseQuery(location.search)
  const org = query.org || getRandomOrg()
  document.body.setAttribute('data-org', org)
  getEl('email_org').value = org

  const variant = query.variant === 'phone-only' ? query.variant : 'full-form'
  document.body.setAttribute('data-variant', variant)

  const position = query.position === 'left' ? 'left' : 'right'
  document.body.setAttribute('data-position', position)

  if ((typeof(query.ga) === 'undefined' || query.ga === 'true' || query.ga === '1') && !navigator.doNotTrack) {
    initGoogleAnalytics(`redalert-widget-${variant}`)
    addTrackingEvents()
  }

  if (todayIs(2018, 5, 9)) {
    maximize()
  }

  document.querySelector('html').classList.remove('invisible');
});
