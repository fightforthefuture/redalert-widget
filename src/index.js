require('./app.scss')

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

    ga('set', 'dimension0', JSON.stringify(document.body.dataset))
    ga('send', 'pageview');
  }
}

function addTrackingEvents() {
  attachEvent('.btn-facebook', 'click', () => trackEvent('facebook_button', 'click'))
  attachEvent('.btn-twitter', 'click', () => trackEvent('twitter_button', 'click'))
  attachEvent('.btn-donate', 'click', () => trackEvent('donate_button', 'click'))
  attachEvent('.btn-events', 'click', () => trackEvent('events_button', 'click'))
  attachEvent('.email-form', 'submit', () => trackEvent('email_form', 'submit'))
  attachEvent('.call-form', 'submit', () => trackEvent('call_form', 'submit'))
  attachEvent('.minimized .close', 'click', () => trackEvent('minimized_close_button', 'click'))
  attachEvent('.minimized .btn', 'click', event => {
    trackEvent('minimized_cta_button', 'click', event.currentTarget.innerHTML)
  })
  attachEvent('.international-cta', 'click', () => trackEvent('international_cta', 'click'))
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

function submitForm(event) {
  event.preventDefault()

  const form = event.currentTarget
  const formData = new FormData(form)
  const xhr = new XMLHttpRequest()

  function onLoad(event) {
    form.setAttribute('data-loading', false)
    const nextStep = parseInt(form.getAttribute('data-next-step'))
    if (document.querySelector(`.step[data-step="${nextStep}"]`)) {
      showStep(nextStep)
    }

    const className = form.getAttribute('class')

    if (className.match(/email/)) {
      pingCounter('email')
    }
    else if (className.match(/call/)) {
      pingCounter('call')
    }
  }

  // TODO: error handling
  xhr.addEventListener('error', onLoad)
  xhr.addEventListener('load', onLoad)
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

  // geocodeIpAddress(geo => {
  //   if (geo.country && geo.country.iso_code && geo.country.iso_code.toLowerCase() !== 'us') {
  //     document.body.setAttribute('data-country', 'non-us')
  //     trackEvent('international_cta', 'show')
  //   }
  // })
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

function isTruthy(str) {
  return typeof(str) === 'undefined' || `${str}` === 'true' || `${str}` === '1'
}

function startTextFlow(phone) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', 'https://text-flow-starter.fftf.xyz/opt-ins')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    opt_in_path: 'OP5953C0BBD1870756CE4041DD8F00C7C1',
    phone: phone
  }))
}

function pingCounter(counter) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', `https://counter.battleforthenet.com/ping/${counter}`)
  xhr.send()
}

function geocodeZip(zipCode, successCallback=console.log, errorCallback=console.error) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', `https://geo.battleforthenet.com/zip/${zipCode.substring(0, 5)}.json`, true)
  xhr.addEventListener('error', errorCallback)
  xhr.addEventListener('load', event => {
    try {
      const geo = JSON.parse(event.currentTarget.responseText)
      successCallback(geo)
    }
    catch (error) {
      errorCallback(error)
    }
  })
  xhr.send()
}

function geocodeIpAddress(successCallback=console.log, errorCallback=console.error) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', 'https://fftf-geocoder.herokuapp.com/', true)
  xhr.addEventListener('error', errorCallback)
  xhr.addEventListener('load', event => {
    try {
      const data = JSON.parse(event.currentTarget.responseText)
      successCallback(data)
    }
    catch (error) {
      errorCallback(error)
    }
  })
  xhr.send()
}

function getCallPowerCampaignId(stateCode) {
  const variant = document.body.getAttribute('data-variant')
  const data = require('./callpower.json')[variant]

  if (stateCode) {
    for (let i = 0; i < data.stateCampaigns.length; i++) {
      const campaign = data.stateCampaigns[i]
      if (campaign.states.indexOf(stateCode) !== -1) {
        return campaign.id
      }
    }
  }

  return data.defaultCampaign
}

function updateCallPowerCampaignIds(stateCode) {
  const campaignId = getCallPowerCampaignId(stateCode)
  const inputs = document.querySelectorAll('input[name="campaignId"]')
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = campaignId
  }
}

function onZipChange(event) {
  const zipCode = event.currentTarget.value

  geocodeZip(zipCode, geo => {
    updateCallPowerCampaignIds(geo.state_code)
  }, error => {
    updateCallPowerCampaignIds(null)
  })
}

function init() {
  if (typeof(Raven) !== 'undefined') {
    Raven.config('https://8509ccd4f5554a6f97faff7cd2ee0861@sentry.io/1203579').install()
  }

  attachEvent('form', 'submit', submitForm)
  attachEvent('.minimized', 'click', maximize)
  attachEvent('.minimized', 'touchstart', maximize)
  attachEvent('.close', 'click', closeWindow)
  attachEvent('.close', 'touchstart', e => e.stopPropagation())
  attachEvent('input.zip', 'change', onZipChange)
  attachEvent('#step1_phone', 'change', e => {
    getEl('step2_phone').value = e.currentTarget.value
  })

  let hasStartedTextFlow = false

  attachEvent('#step1 .email-form', 'submit', e => {
    const phone = getEl('step1_phone').value

    if (!hasStartedTextFlow && phone && org === 'fftf') {
      startTextFlow(phone)
      hasStartedTextFlow = true
    }
  })

  const query = parseQuery(location.search)
  const org = query.org || getRandomOrg()
  document.body.setAttribute('data-org', org)
  getEl('email_org').value = org

  const variant = query.variant === 'phone-only' ? query.variant : 'full-form'
  document.body.setAttribute('data-variant', variant)

  const position = query.position === 'left' ? 'left' : 'right'
  document.body.setAttribute('data-position', position)

  const language = location.pathname.replace(/^(\/index-|\/)/, '').replace(/\.html$/, '') || 'en'
  document.body.setAttribute('data-language', language)

  if (isTruthy(query.ga) && !navigator.doNotTrack) {
    initGoogleAnalytics(`redalert-widget-${variant}`)
    addTrackingEvents()
  }

  const isDayOfAction = todayIs(2018, 5, 15) || todayIs(2018, 5, 16)

  if (query.maximized || (isTruthy(query.dayofaction) && isDayOfAction)) {
    maximize()
  }

  if (!isTruthy(query.donations)) {
    document.body.setAttribute('data-donations', 'false')
  }

  document.querySelector('html').classList.remove('invisible');
}
document.addEventListener('DOMContentLoaded', init)

