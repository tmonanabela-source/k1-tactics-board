/* K1 Shooters Tactics Board — the club badge, recreated as SVG from the K1 Shooters logo.
 * Circular crest · outer + inner rings · shield with "EST 2019" · striker silhouette ·
 * two footballs on the band · "K1 SHOOTERS" arched above, "FOOTBALL ACADEMY" arched below.
 * If the coach uploads the real PNG logo it is stored in localStorage and used instead. */
(function (K1) {
  'use strict';

  const NAVY = '#131c21';
  const PAPER = '#fbfcfc';

  function ball(cx, cy, r, ink, paper) {
    const s = r / 20;
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')">' +
      '<circle r="20" fill="' + paper + '" stroke="' + ink + '" stroke-width="3.5"/>' +
      '<path d="M0 -6.5l6.3 4.6-2.4 7.4H-3.9l-2.4-7.4z" fill="' + ink + '"/>' +
      '<path d="M0 -6.5V-17M6.3 -1.9l9.8-3.2M3.9 5.5l6 8.4M-3.9 5.5l-6 8.4M-6.3 -1.9l-9.8-3.2" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-16.1 -5.1l-1.5-6.5 4.6-4.8zM16.1 -5.1l1.5-6.5-4.6-4.8zM9.9 13.9l6.6-.6 1.7-6.3zM-9.9 13.9l-6.6-.6-1.7-6.3zM0 -17l-5.2-3.5h10.4z" fill="' + ink + '"/>' +
      '</g>';
  }

  /** Striker silhouette (thick stroked strokes read as a solid figure at any size). */
  function striker(ink) {
    return '<g fill="none" stroke="' + ink + '" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="262" cy="243" r="14" fill="' + ink + '" stroke="none"/>' +
      '<path d="M258 262c-4 12-8 26-10 42" stroke-width="24"/>' +          // torso
      '<path d="M254 270l-24 20-14-6" stroke-width="10"/>' +               // back arm
      '<path d="M262 268l24 10 12-14" stroke-width="10"/>' +               // front arm
      '<path d="M247 304l-12 30-6 34" stroke-width="14"/>' +               // standing leg
      '<path d="M229 368l-12 4" stroke-width="10"/>' +                     // standing foot
      '<path d="M249 304l24 20 24 30" stroke-width="14"/>' +               // kicking leg
      '<path d="M297 354l14 4" stroke-width="10"/>' +                      // kicking foot
      '</g>' +
      ball(327, 380, 15, ink, PAPER);
  }

  /**
   * Full crest.
   * @param {object} o  { size, ink, paper, textOnly:false, background:true }
   */
  function badge(o) {
    o = o || {};
    const size = o.size || 120;
    const ink = o.ink || NAVY;
    const paper = o.paper || PAPER;
    const bg = o.background !== false;
    const font = "Impact, 'Arial Black', 'Barlow Condensed', 'Segoe UI', Arial, sans-serif";
    return '<svg class="k1-badge" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="' + size + '" height="' + size + '" role="img" aria-label="K1 Shooters Football Academy crest">' +
      '<defs>' +
      '<path id="k1ArcTop" d="M84 256A172 172 0 0 1 428 256"/>' +
      '<path id="k1ArcBot" d="M52 256A204 204 0 0 0 460 256"/>' +
      '</defs>' +
      (bg ? '<circle cx="256" cy="256" r="252" fill="' + paper + '"/>' : '') +
      '<circle cx="256" cy="256" r="238" fill="none" stroke="' + ink + '" stroke-width="12"/>' +
      '<circle cx="256" cy="256" r="150" fill="none" stroke="' + ink + '" stroke-width="16"/>' +
      // shield
      '<path d="M190 160h132v98c0 46-36 80-66 96-30-16-66-50-66-96z" fill="' + paper + '" stroke="' + ink + '" stroke-width="12" stroke-linejoin="round"/>' +
      '<text x="256" y="196" text-anchor="middle" font-family="' + font + '" font-size="19" font-weight="700" letter-spacing="1" fill="' + ink + '">EST 2019</text>' +
      striker(ink) +
      ball(67, 256, 21, ink, paper) +
      ball(445, 256, 21, ink, paper) +
      '<text font-family="' + font + '" font-size="56" font-weight="800" letter-spacing="3" fill="' + ink + '">' +
      '<textPath href="#k1ArcTop" startOffset="50%" text-anchor="middle">K1 SHOOTERS</textPath></text>' +
      '<text font-family="' + font + '" font-size="42" font-weight="800" letter-spacing="2.5" fill="' + ink + '">' +
      '<textPath href="#k1ArcBot" startOffset="50%" text-anchor="middle">FOOTBALL ACADEMY</textPath></text>' +
      '</svg>';
  }

  /** Compact mark for tiny sizes (topbar / favicon): rings + shield + "K1". */
  function mark(o) {
    o = o || {};
    const size = o.size || 32;
    const ink = o.ink || NAVY;
    const paper = o.paper || PAPER;
    return '<svg class="k1-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="' + size + '" height="' + size + '" role="img" aria-label="K1 Shooters">' +
      '<circle cx="256" cy="256" r="252" fill="' + paper + '"/>' +
      '<circle cx="256" cy="256" r="230" fill="none" stroke="' + ink + '" stroke-width="22"/>' +
      '<path d="M150 130h212v130c0 78-58 132-106 156-48-24-106-78-106-156z" fill="' + ink + '"/>' +
      '<text x="256" y="292" text-anchor="middle" font-family="Impact, \'Arial Black\', Arial, sans-serif" font-size="150" font-weight="800" fill="' + paper + '">K1</text>' +
      '</svg>';
  }

  /** The image to brand the app with: an uploaded logo wins, then the bundled K1 crest, else null (SVG fallback). */
  function brandLogo() {
    const custom = K1.customLogo ? K1.customLogo() : null;
    return custom || K1.BUNDLED_LOGO || null;
  }

  /** Returns the club logo as an <img> (uploaded or bundled crest) or the drawn SVG crest as a last resort. */
  function logoHTML(size, cls) {
    const src = brandLogo();
    if (src) return '<img class="k1-badge-img ' + (cls || '') + '" src="' + src + '" width="' + size + '" height="' + size + '" alt="K1 Shooters crest">';
    return badge({ size: size });
  }

  K1.LOGO = { NAVY: NAVY, PAPER: PAPER, badge: badge, mark: mark, ball: ball };
  K1.logoHTML = logoHTML;
  K1.brandLogo = brandLogo;
})(window.K1 = window.K1 || {});
