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
  const text = document.getElementById('bio-modal-text')
  if (!modal || !image || !name || !text) return

  const src = trigger.getAttribute('data-bio-src')
  const bioName = trigger.getAttribute('data-bio-name') || 'Team Member'
  const bioText = trigger.getAttribute('data-bio-text') || ''
  const thumb = trigger.querySelector('img')
  const alt = thumb ? thumb.getAttribute('alt') : `${bioName} profile photo`

  if (!src) return
  image.setAttribute('src', src)
  image.setAttribute('alt', alt || `${bioName} profile photo`)
  name.textContent = bioName
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
