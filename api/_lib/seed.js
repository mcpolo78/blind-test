// Contenu de départ des deux playlists : « Dessins animés » et « Séries TV »
// (15 génériques chacune).
// - Copié en base au premier démarrage, puis une fois par nouvelle version de
//   SEED_VERSION (voir db.js) : les playlists '80' et '2000' sont alors vidées et
//   remplies avec cette liste. Les autres playlists créées dans l'admin ne sont
//   jamais touchées. Entre deux versions, tout se gère depuis /admin.
// - deezerId : titre Deezer (extrait de 30 s lu à la volée).
// - Vignette : image (URL fixe, Wikipédia ; les SVG passent par une miniature
//   PNG), sinon pochette de coverAlbumId, sinon pochette de l'album du titre.
// - Les slugs '80' et '2000' viennent des anciens modes « époque » : on les garde
//   pour que les liens de défi existants restent valables.
export const SEED_VERSION = 'dessins-animes-series-v1'

export const SEED_PLAYLISTS = [
  { slug: '80', name: 'Dessins animés' },
  { slug: '2000', name: 'Séries TV' },
]

const W = 'https://upload.wikimedia.org/wikipedia/'

export const SEED_TRACKS = [
  { playlist: '80', name: 'Dragon Ball Z', deezerId: 97792174,
    image: W + 'commons/thumb/0/0b/Dragon_Ball_Z_logo.svg/330px-Dragon_Ball_Z_logo.svg.png' },
  { playlist: '80', name: 'Les Chevaliers du Zodiaque', deezerId: 8134110,
    image: W + 'en/7/75/Saint_Seiya_1.png' },
  { playlist: '80', name: 'Nicky Larson', deezerId: 97792162,
    image: W + 'en/d/dd/City_Hunter_1.png' },
  { playlist: '80', name: 'Olive et Tom', deezerId: 16978466,
    image: W + 'en/0/09/Captain_Tsubasa_1.png' },
  { playlist: '80', name: 'Pokémon', deezerId: 3261232781,
    image: W + 'commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/330px-International_Pok%C3%A9mon_logo.svg.png' },
  { playlist: '80', name: 'Denver, le dernier dinosaure', deezerId: 1744602287,
    image: W + 'en/f/f3/Denver_the_Last_Dinosaur_title_card.jpg' },
  { playlist: '80', name: 'Inspecteur Gadget', deezerId: 81670580,
    image: W + 'en/1/12/Inspector_Gadget_print_logo.png' },
  { playlist: '80', name: "Les Mystérieuses Cités d'or", deezerId: 81670594,
    image: W + 'en/8/8e/The_Mysterious_Cities_of_Gold_%281982%29_promotional_cover.jpg' },
  { playlist: '80', name: "Cat's Eyes", deezerId: 38892111,
    image: W + 'en/8/87/Cat%27s_Eye_vol._8.png' },
  { playlist: '80', name: 'Tom Sawyer', deezerId: 2725527131,
    image: W + 'en/2/2e/Las_aventuras_de_Tom_Sawyer.JPG' },
  { playlist: '80', name: 'Ulysse 31', deezerId: 81670602,
    image: W + 'en/0/05/Ulysses_31_logo.jpg' },
  { playlist: '80', name: 'Capitaine Flam', deezerId: 66114627,
    image: W + 'en/e/ef/Captain_Future_anime_screenshot.jpg' },
  { playlist: '80', name: 'Goldorak', deezerId: 393264092,
    image: W + 'en/c/cc/Ufo_Grendizer_title.png' },
  { playlist: '80', name: 'Albator', deezerId: 38892081,
    image: W + 'en/b/bb/Captain_Herlock_vol_1.jpg' },
  { playlist: '80', name: 'Il était une fois… la Vie', deezerId: 1181039152,
    image: W + 'en/7/71/Once_Upon_a_Time_Life.jpg' },

  { playlist: '2000', name: 'Friends', deezerId: 769477,
    image: W + 'commons/thumb/b/bc/Friends_logo.svg/330px-Friends_logo.svg.png' },
  { playlist: '2000', name: 'Le Prince de Bel-Air', deezerId: 831350,
    image: W + 'en/thumb/c/c4/Fresh_Prince_Bel_Aire_logo.svg/330px-Fresh_Prince_Bel_Aire_logo.svg.png' },
  { playlist: '2000', name: 'Alerte à Malibu', deezerId: 64570774,
    image: W + 'commons/thumb/e/eb/Baywatch-logo.svg/330px-Baywatch-logo.svg.png' },
  { playlist: '2000', name: 'X-Files', deezerId: 3910006,
    image: W + 'en/5/5e/The_X-Files_original_title_screen.webp' },
  { playlist: '2000', name: 'K2000', deezerId: 1053752862,
    image: W + 'en/7/7b/Knight_Rider_%2882-86%29_series_logo.png' },
  { playlist: '2000', name: 'MacGyver', deezerId: 90700363 },
  { playlist: '2000', name: "L'Agence tous risques", deezerId: 17955553 },
  { playlist: '2000', name: 'Magnum', deezerId: 756660 },
  { playlist: '2000', name: 'Beverly Hills', deezerId: 14630815,
    image: W + 'commons/thumb/2/22/Beverly_Hills_90210_%28Spelling_Television_series%29_logo.svg/330px-Beverly_Hills_90210_%28Spelling_Television_series%29_logo.svg.png' },
  { playlist: '2000', name: 'Dallas', deezerId: 81670576,
    image: W + 'en/3/31/DallasLogo.jpg' },
  { playlist: '2000', name: 'Hélène et les garçons', deezerId: 16558913,
    image: W + 'fr/thumb/a/a6/H%C3%A9l%C3%A8ne_et_les_gar%C3%A7ons.svg/330px-H%C3%A9l%C3%A8ne_et_les_gar%C3%A7ons.svg.png' },
  { playlist: '2000', name: 'Premiers Baisers', deezerId: 99314696,
    image: W + 'commons/9/94/Premiers_Baisers_Logo.png' },
  { playlist: '2000', name: 'Smallville', deezerId: 3664135,
    image: W + 'commons/thumb/f/f1/Smallville_2001_logo.svg/330px-Smallville_2001_logo.svg.png' },
  { playlist: '2000', name: 'Dawson', deezerId: 3667834,
    image: W + 'commons/thumb/a/ae/Dawson%27s_Creek_%28Sony_Pictures_Television%29_logo.svg/330px-Dawson%27s_Creek_%28Sony_Pictures_Television%29_logo.svg.png' },
  { playlist: '2000', name: 'Game of Thrones', deezerId: 117729466,
    image: W + 'commons/e/e2/Game_of_thrones_HBO_logo.png' },
]
