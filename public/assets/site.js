const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
function closeMenu(returnFocus = false) {
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation');
  nav?.classList.remove('is-open');
  if (returnFocus) toggle?.focus();
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav?.classList.toggle('is-open', open);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

const contents = document.querySelector('.toc-disclosure');
if (contents) {
  const narrow = window.matchMedia('(max-width: 680px)');
  const setContentsLayout = () => { contents.open = !narrow.matches; };
  setContentsLayout();
  narrow.addEventListener('change', setContentsLayout);
  contents.addEventListener('click', event => {
    if (event.target.closest('a') && narrow.matches) contents.open = false;
  });
}
