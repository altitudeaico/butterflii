// Single source of truth for the site-wide promo banner + homepage promo poster.
// Edit this file to change or retire the current promo across every page at once.
window.PROMO_CONFIG = {
  enabled: true,
  discountPercent: '20%',
  discountRest: 'your entire order',
  code: 'ELSIE20',
  shopUrl: 'shop.html',

  // Homepage promo poster (Part 2). Set posterEnabled to true once the image
  // file exists at images/<posterImage>.webp / .jpg
  posterEnabled: false,
  posterImage: 'promo-poster',
  posterAlt: '20% off Elsie\'s original paintings — shop the current promotion'
};
