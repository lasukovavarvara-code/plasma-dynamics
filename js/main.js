// Мобильное меню (бургер)
(function () {
  'use strict';

  var burger = document.querySelector('.header__burger');
  var nav = document.getElementById('main-nav');

  if (!burger || !nav) return;

  burger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
})();
