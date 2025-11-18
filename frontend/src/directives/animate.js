export const animate = {
  mounted(el, binding) {
    const animations = {
      fadeIn: 'animate__fadeIn',
      slideIn: 'animate__slideInUp',
      bounce: 'animate__bounce'
    }

    el.classList.add('animate__animated')
    el.classList.add(animations[binding.value] || animations.fadeIn)
  }
} 