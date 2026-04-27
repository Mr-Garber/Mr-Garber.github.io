function toggleMenu() {
  const navLinks = document.getElementById('nav-links')
  const toggle = document.getElementById('menu-toggle')
  const overlay = document.getElementById('menu-overlay')
  if (!navLinks || !toggle || !overlay) return

  navLinks.classList.toggle('active')
  toggle.classList.toggle('active')
  overlay.classList.toggle('active')
}

document.addEventListener('click', event => {
  const target = event.target
  if (!(target instanceof Element)) return

  if (target.closest('#menu-toggle') || target.closest('#menu-overlay') || target.closest('#nav-links a')) {
    toggleMenu()
  }

  const posterTrigger = target.closest('.poster-card')
  if (posterTrigger instanceof HTMLElement) {
    openPosterModal(posterTrigger)
    return
  }

  const bioTrigger = target.closest('.profile-pic-card')
  if (bioTrigger instanceof HTMLElement) {
    openBioModal(bioTrigger)
    return
  }

  const playbillTrigger = target.closest('.playbill-trigger, .playbill-title-trigger')
  if (playbillTrigger instanceof HTMLElement) {
    openPastCarousel(playbillTrigger)
    return
  }

  if (target.closest('[data-close-poster-modal]')) {
    closePosterModal()
  }

  if (target.closest('[data-close-bio-modal]')) {
    closeBioModal()
  }

  if (target.closest('[data-close-past-carousel]')) {
    closePastCarousel()
  }

  if (target.closest('[data-past-carousel-prev]')) {
    showPastCarouselPrev()
  }

  if (target.closest('[data-past-carousel-next]')) {
    showPastCarouselNext()
  }
})

document.addEventListener('pointerenter', event => {
  const target = event.target
  if (!(target instanceof Element)) return

  const playbillTrigger = target.closest('.playbill-trigger, .playbill-title-trigger')
  if (playbillTrigger instanceof HTMLElement) {
    prewarmPastGallery(playbillTrigger)
  }
}, true)

document.addEventListener('focusin', event => {
  const target = event.target
  if (!(target instanceof Element)) return

  const playbillTrigger = target.closest('.playbill-trigger, .playbill-title-trigger')
  if (playbillTrigger instanceof HTMLElement) {
    prewarmPastGallery(playbillTrigger)
  }
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closePosterModal()
    closeBioModal()
    closePastCarousel()
  }

  const modal = document.getElementById('past-carousel-modal')
  if (!modal || !modal.classList.contains('open')) return

  if (event.key === 'ArrowLeft') {
    showPastCarouselPrev()
  }

  if (event.key === 'ArrowRight') {
    showPastCarouselNext()
  }
})

document.addEventListener('DOMContentLoaded', () => {
  loadPastGalleryManifest()
  warmPastGalleriesInBackground()
  initContactFormRouting()
  initFormspreeForms()
  initPhoneFormatting()
})

function openPosterModal(trigger) {
  const modal = document.getElementById('poster-modal')
  const image = document.getElementById('poster-modal-image')
  const title = document.getElementById('poster-modal-title')
  const quick = document.getElementById('poster-modal-quick')
  const blurb = document.getElementById('poster-modal-blurb')
  const registerTop = document.getElementById('poster-modal-register-top')
  const register = document.getElementById('poster-modal-register')
  if (!modal || !image || !title || !quick || !blurb || !registerTop || !register) return

  const src = trigger.getAttribute('data-poster-src')
  const posterTitle = trigger.getAttribute('data-poster-title') || 'Show Poster'
  const posterQuick =
    trigger.getAttribute('data-poster-logistics') ||
    trigger.getAttribute('data-poster-quick') ||
    ''
  const posterBlurb = trigger.getAttribute('data-poster-blurb') || ''
  const shouldShowRegister = trigger.getAttribute('data-poster-register') === 'true'
  const thumb = trigger.querySelector('img')
  const alt = thumb ? thumb.getAttribute('alt') : posterTitle

  if (!src) return
  image.setAttribute('src', src)
  image.setAttribute('alt', alt || posterTitle)
  title.textContent = posterTitle
  quick.textContent = posterQuick
  blurb.textContent = posterBlurb
  registerTop.classList.toggle('is-hidden', !shouldShowRegister)
  register.classList.toggle('is-hidden', !shouldShowRegister)
  modal.classList.add('open')
  modal.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
}

function closePosterModal() {
  const modal = document.getElementById('poster-modal')
  const image = document.getElementById('poster-modal-image')
  const quick = document.getElementById('poster-modal-quick')
  const blurb = document.getElementById('poster-modal-blurb')
  const registerTop = document.getElementById('poster-modal-register-top')
  const register = document.getElementById('poster-modal-register')
  if (!modal || !image || !quick || !blurb || !registerTop || !register) return

  modal.classList.remove('open')
  modal.setAttribute('aria-hidden', 'true')
  image.setAttribute('src', '')
  quick.textContent = ''
  blurb.textContent = ''
  registerTop.classList.add('is-hidden')
  register.classList.add('is-hidden')
  document.body.style.overflow = ''
}

function openBioModal(trigger) {
  const modal = document.getElementById('bio-modal')
  const image = document.getElementById('bio-modal-image')
  const name = document.getElementById('bio-modal-name')
  const title = document.getElementById('bio-modal-title')
  const text = document.getElementById('bio-modal-text')
  if (!modal || !image || !name || !title || !text) return

  const src = trigger.getAttribute('data-bio-src')
  const bioNameRaw = trigger.getAttribute('data-bio-name') || 'Team Member'
  const bioTitleAttr = trigger.getAttribute('data-bio-title') || ''
  const bioText = trigger.getAttribute('data-bio-text') || ''
  const thumb = trigger.querySelector('img')
  const splitName = bioNameRaw.split(' - ')
  const bioName = splitName[0] || bioNameRaw
  const bioTitle = bioTitleAttr || splitName.slice(1).join(' - ')
  const alt = thumb ? thumb.getAttribute('alt') : `${bioNameRaw} profile photo`

  if (!src) return
  image.setAttribute('src', src)
  image.setAttribute('alt', alt || `${bioNameRaw} profile photo`)
  name.textContent = bioName
  title.textContent = bioTitle
  text.textContent = bioText
  modal.classList.add('open')
  modal.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
}

function closeBioModal() {
  const modal = document.getElementById('bio-modal')
  const image = document.getElementById('bio-modal-image')
  if (!modal || !image) return

  modal.classList.remove('open')
  modal.setAttribute('aria-hidden', 'true')
  image.setAttribute('src', '')
  document.body.style.overflow = ''
}

const pastCarouselState = {
  images: [],
  title: '',
  index: 0,
}

const pastGalleryCache = new Map()
const pastGalleryManifestUrl = 'scripts/past-productions-manifest.json'
let pastGalleryManifestPromise = null

async function openPastCarousel(trigger) {
  const modal = document.getElementById('past-carousel-modal')
  if (!modal) return

  const folder = trigger.getAttribute('data-gallery-folder')
  const title = trigger.getAttribute('data-carousel-title') || 'Past Production'
  const images = folder ? await getPastGalleryImages(folder) : []

  if (!images.length) return

  pastCarouselState.images = images
  pastCarouselState.title = title
  pastCarouselState.index = 0
  renderPastCarousel()

  modal.classList.add('open')
  modal.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
}

async function getPastGalleryImages(folder) {
  if (pastGalleryCache.has(folder)) {
    return pastGalleryCache.get(folder)
  }

  const loadPromise = loadPastGalleryImages(folder)
  pastGalleryCache.set(folder, loadPromise)

  const images = await loadPromise
  pastGalleryCache.set(folder, images)
  return images
}

async function loadPastGalleryImages(folder) {
  const manifest = await loadPastGalleryManifest()
  const images = manifest && Array.isArray(manifest[folder]) ? manifest[folder] : []
  return images
}

async function loadPastGalleryManifest() {
  if (pastGalleryManifestPromise) {
    return pastGalleryManifestPromise
  }

  pastGalleryManifestPromise = fetch(pastGalleryManifestUrl, { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Unable to load past productions manifest: ${response.status}`)
      }

      return response.json()
    })
    .catch(error => {
      console.error(error)
      pastGalleryManifestPromise = null
      return {}
    })

  return pastGalleryManifestPromise
}

function preloadPastGalleryImages(images) {
  images.forEach(src => {
    const preloaded = new Image()
    preloaded.src = src
  })
}

function prewarmPastGallery(trigger) {
  const folder = trigger.getAttribute('data-gallery-folder')
  if (!folder || pastGalleryCache.has(folder)) return

  getPastGalleryImages(folder)
    .then(preloadPastGalleryImages)
    .catch(() => {
      pastGalleryCache.delete(folder)
    })
}

function warmPastGalleriesInBackground() {
  const folders = Array.from(
    new Set(
      Array.from(document.querySelectorAll('[data-gallery-folder]'))
        .map(element => element.getAttribute('data-gallery-folder'))
        .filter(Boolean)
    )
  )

  if (!folders.length) return

  const warmAll = () => {
    folders.forEach(folder => {
      if (!folder || pastGalleryCache.has(folder)) return

      getPastGalleryImages(folder)
        .then(preloadPastGalleryImages)
        .catch(() => {
          pastGalleryCache.delete(folder)
        })
    })
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(warmAll, { timeout: 1200 })
    return
  }

  window.setTimeout(warmAll, 300)
}

function closePastCarousel() {
  const modal = document.getElementById('past-carousel-modal')
  if (!modal) return

  modal.classList.remove('open')
  modal.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
}

function showPastCarouselPrev() {
  if (!pastCarouselState.images.length) return
  pastCarouselState.index = (pastCarouselState.index - 1 + pastCarouselState.images.length) % pastCarouselState.images.length
  renderPastCarousel()
}

function showPastCarouselNext() {
  if (!pastCarouselState.images.length) return
  pastCarouselState.index = (pastCarouselState.index + 1) % pastCarouselState.images.length
  renderPastCarousel()
}

function renderPastCarousel() {
  const image = document.getElementById('past-carousel-image')
  const title = document.getElementById('past-carousel-title')
  const count = document.getElementById('past-carousel-count')
  if (!image || !title || !count || !pastCarouselState.images.length) return

  const currentSrc = pastCarouselState.images[pastCarouselState.index]
  image.setAttribute('src', currentSrc)
  image.setAttribute('alt', `${pastCarouselState.title} image ${pastCarouselState.index + 1}`)
  title.textContent = pastCarouselState.title
  count.textContent = `${pastCarouselState.index + 1} / ${pastCarouselState.images.length}`
}

function initContactFormRouting() {
  const form = document.querySelector('.contact-form')
  if (!(form instanceof HTMLFormElement)) return

  const nameField = form.querySelector('input[name="name"]')
  const emailField = form.querySelector('input[name="email"]')
  const subjectField = form.querySelector('select[name="subject"]')
  const messageField = form.querySelector('textarea[name="message"]')
  const recipientField = form.querySelector('input[name="recipient_email"]')
  if (
    !(nameField instanceof HTMLInputElement) ||
    !(emailField instanceof HTMLInputElement) ||
    !(subjectField instanceof HTMLSelectElement) ||
    !(messageField instanceof HTMLTextAreaElement) ||
    !(recipientField instanceof HTMLInputElement)
  ) return

  const caitlynAction = form.dataset.caitlynAction || ''
  const markAction = form.dataset.markAction || ''
  const recipientMap = {
    'student-on-stage': 'cgarber@flcs.k12.in.us',
    'student-stage-tech': 'cgarber@flcs.k12.in.us',
    'adult-set-building': 'mrkrontz76@gmail.com',
    'adult-stage-tech': 'cgarber@flcs.k12.in.us',
    'adult-show-days': 'mrkrontz76@gmail.com',
    'sponsor-opportunities-questions': 'mrkrontz76@gmail.com',
  }

  const updateRecipient = () => {
    const subjectValue = subjectField.value
    const shouldRouteToCaitlyn =
      subjectValue.startsWith('student-') || subjectValue === 'adult-stage-tech'

    recipientField.value = recipientMap[subjectValue] || ''

    if (subjectValue) {
      form.action = shouldRouteToCaitlyn ? caitlynAction : markAction
    } else if (caitlynAction) {
      form.action = caitlynAction
    }
  }

  const fieldPrompts = new Map([
    [nameField, 'Please enter your name.'],
    [emailField, 'Please enter your email address.'],
    [subjectField, 'Please choose a subject.'],
    [messageField, 'Please enter your message.'],
  ])

  const trimFieldValue = field => {
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement
    ) {
      field.value = field.value.trim()
    }
  }

  const validateField = field => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
      return
    }

    field.setCustomValidity('')

    if (field.validity.valueMissing) {
      field.setCustomValidity(fieldPrompts.get(field) || 'Please complete this field.')
      return
    }

    if (field instanceof HTMLInputElement && field.type === 'email' && field.validity.typeMismatch) {
      field.setCustomValidity('Please enter a valid email address.')
      return
    }

    if ('value' in field && typeof field.value === 'string' && !field.value.trim()) {
      field.setCustomValidity(fieldPrompts.get(field) || 'Please complete this field.')
    }
  }

  ;[nameField, emailField, subjectField, messageField].forEach(field => {
    const eventName = field instanceof HTMLSelectElement ? 'change' : 'input'
    field.addEventListener(eventName, () => validateField(field))
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.addEventListener('blur', () => {
        trimFieldValue(field)
        validateField(field)
      })
    }
    field.addEventListener('invalid', () => validateField(field))
  })

  form.addEventListener('submit', event => {
    ;[nameField, emailField, messageField].forEach(field => trimFieldValue(field))
    ;[nameField, emailField, subjectField, messageField].forEach(field => validateField(field))

    if (!form.checkValidity()) {
      event.preventDefault()
      form.reportValidity()
    }
  })

  subjectField.addEventListener('change', updateRecipient)
  updateRecipient()
}

function initFormspreeForms() {
  const forms = document.querySelectorAll('[data-formspree-form]')
  forms.forEach(form => {
    if (!(form instanceof HTMLFormElement)) return

    const status = form.querySelector('[data-form-status]')
    const submitButton = form.querySelector('button[type="submit"]')
    if (!(submitButton instanceof HTMLButtonElement)) return

    const fields = Array.from(form.querySelectorAll('input, select, textarea'))
    fields.forEach(field => {
      if (
        !(
          field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement
        )
      ) {
        return
      }

      const eventName = field instanceof HTMLSelectElement ? 'change' : 'input'
      field.addEventListener(eventName, () => validateGenericFormField(field))

      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener('blur', () => {
          if (field.type !== 'checkbox') {
            field.value = field.value.trim()
          }
          validateGenericFormField(field)
        })
      }

      field.addEventListener('invalid', () => validateGenericFormField(field))
    })

    form.addEventListener('submit', async event => {
      event.preventDefault()

      fields.forEach(field => {
        if (
          (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) &&
          field.type !== 'checkbox'
        ) {
          field.value = field.value.trim()
        }
        validateGenericFormField(field)
      })

      if (!form.reportValidity()) {
        return
      }

      const selectedPaymentMethod = getSelectedPaymentMethod(form)
      const isOnlinePayment = selectedPaymentMethod === 'Online Payment'
      const endpoint = (form.dataset.formspreeEndpoint || form.getAttribute('action') || '').trim()
      const looksConfigured =
        endpoint &&
        /^https:\/\/formspree\.io\/f\/[^/\s]+$/i.test(endpoint) &&
        !/REPLACE_WITH_YOUR_FORM_ID/i.test(endpoint)

      if (!looksConfigured) {
        setFormStatus(
          status,
          'Add your real Formspree endpoint to this page before publishing the registration form.',
          'error'
        )
        return
      }

      submitButton.disabled = true
      const originalButtonText = submitButton.textContent
      submitButton.textContent = 'Sending...'
      setFormStatus(status, 'Submitting your registration...', 'pending')

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body: new FormData(form),
        })

        if (!response.ok) {
          throw new Error(`Formspree request failed with status ${response.status}`)
        }

        form.reset()
        setFormStatus(
          status,
          form.dataset.successMessage || 'Your submission has been sent successfully.',
          'success'
        )

        if (isOnlinePayment) {
          const paymentUrl = (form.dataset.onlinePaymentUrl || '').trim()
          if (paymentUrl) {
            window.location.href = paymentUrl
            return
          }
        }

        const successRedirect = (form.dataset.successRedirect || '').trim()
        if (successRedirect) {
          window.location.href = successRedirect
          return
        }
      } catch (error) {
        console.error(error)
        setFormStatus(
          status,
          'We could not submit the form right now. Please try again in a moment.',
          'error'
        )
      } finally {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText || 'Submit'
      }
    })
  })
}

function setFormStatus(statusElement, message, tone) {
  if (!(statusElement instanceof HTMLElement)) return

  statusElement.textContent = message
  statusElement.dataset.state = tone || ''
}

function initPhoneFormatting() {
  const phoneFields = document.querySelectorAll('input[type="tel"]')
  phoneFields.forEach(field => {
    if (!(field instanceof HTMLInputElement)) return

    field.setAttribute('inputmode', 'numeric')
    field.setAttribute('maxlength', '14')

    field.addEventListener('input', () => {
      const digits = field.value.replace(/\D/g, '').slice(0, 10)
      field.value = formatPhoneNumber(digits)
    })
  })
}

function formatPhoneNumber(digits) {
  if (!digits) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function validateGenericFormField(field) {
  if (
    !(
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
    )
  ) {
    return
  }

  field.setCustomValidity('')

  if (field.validity.valueMissing) {
    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      field.setCustomValidity('Please confirm this checkbox before submitting.')
      return
    }

    field.setCustomValidity('Please complete this field.')
    return
  }

  if (field instanceof HTMLInputElement && field.type === 'email') {
    const emailValue = field.value.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (emailValue && !emailPattern.test(emailValue)) {
      field.setCustomValidity('Please enter a valid email address.')
      return
    }
  }
}

function getSelectedPaymentMethod(form) {
  if (!(form instanceof HTMLFormElement)) return ''

  const selected = form.querySelector('input[name="payment_method"]:checked')
  if (!(selected instanceof HTMLInputElement)) return ''

  return selected.value
}
