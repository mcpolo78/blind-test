// Contenu de départ des deux playlists (20 génériques chacune), tous diffusés
// au Club Dorothée (TF1, 1987-1997), en version française.
// - Copié en base au premier démarrage, puis une fois par nouvelle version de
//   SEED_VERSION (voir db.js) : les playlists '80' et '2000' sont alors vidées et
//   remplies avec cette liste. Les autres playlists créées dans l'admin ne sont
//   jamais touchées. Entre deux versions, tout se gère depuis /admin.
// - deezerId : titre Deezer (extrait de 30 s lu à la volée).
// - Vignette : image (URL fixe, Wikipédia), sinon pochette de coverAlbumId,
//   sinon pochette de l'album du titre.
// - Les slugs '80' et '2000' viennent des anciens modes « époque » : on les garde
//   pour que les liens de défi existants restent valables.
export const SEED_VERSION = 'club-dorothee-v1'

export const SEED_PLAYLISTS = [
  { slug: '80', name: 'Club Dorothée : action et aventure' },
  { slug: '2000', name: 'Club Dorothée : rires et romance' },
]

const W = 'https://upload.wikimedia.org/wikipedia/'

export const SEED_TRACKS = [
  { playlist: '80', name: 'Dragon Ball', deezerId: 96808638,
    image: W + 'commons/thumb/f/f3/Dragon_Ball_anime_logo.png/250px-Dragon_Ball_anime_logo.png' },
  { playlist: '80', name: 'Dragon Ball Z', deezerId: 97792174, coverAlbumId: 9942266 },
  { playlist: '80', name: 'Les Chevaliers du Zodiaque', deezerId: 8134110,
    image: W + 'en/b/b8/Knights_of_the_Zodiac_Saint_Seiya_poster.jpg' },
  { playlist: '80', name: 'Nicky Larson', deezerId: 97792162,
    image: W + 'en/d/dd/City_Hunter_1.png' },
  { playlist: '80', name: 'Ken le Survivant', deezerId: 6473904,
    image: W + 'en/c/ce/Fist_of_the_North_Star_1.png' },
  { playlist: '80', name: 'Les Samouraïs de l\'éternel', deezerId: 8134113,
    image: W + 'en/c/c1/RONINWARRIORSPoster.jpg' },
  { playlist: '80', name: 'Fly', deezerId: 96816992,
    image: W + 'en/9/9d/DragonquestTheAdventureOfDai_vol1_Cover.jpg' },
  { playlist: '80', name: 'Muscleman', deezerId: 6473909,
    image: W + 'en/a/aa/Kinnikuman_%28Jump_Comics%29.jpg' },
  { playlist: '80', name: 'Shurato', deezerId: 594252842,
    image: W + 'en/8/8f/Shuratologo.jpg' },
  { playlist: '80', name: 'Galaxy Express 999', deezerId: 96808648,
    image: W + 'en/f/f2/Galaxy_Express_999_manga_vol_1_%281994_reprint%29.jpg' },
  { playlist: '80', name: 'Bioman', deezerId: 8134111,
    image: W + 'en/f/f2/ChoudenshiBiomanLogo.png' },
  { playlist: '80', name: 'Flashman', deezerId: 96808640,
    image: W + 'en/6/64/Flashman_Title_Card.jpg' },
  { playlist: '80', name: 'Spielvan', deezerId: 96808636,
    image: W + 'en/4/48/Spielban5th.png' },
  { playlist: '80', name: 'Turbo Rangers', deezerId: 8134112,
    image: W + 'en/8/85/Turboranger_Title_Card.jpg' },
  { playlist: '80', name: 'Winspector', deezerId: 8134118,
    image: W + 'en/9/9e/TokkeiWinspector.jpg' },
  { playlist: '80', name: 'Jiban', deezerId: 594252802,
    image: W + 'en/1/13/KKJ_DVD.jpg' },
  { playlist: '80', name: 'Giraya', deezerId: 6473916,
    image: W + 'en/2/2c/Jiraiya_title_card.jpg' },
  { playlist: '80', name: 'Metalder', deezerId: 6473923,
    image: W + 'en/a/a0/Metalder6th.png' },
  { playlist: '80', name: 'Jaspion', deezerId: 594252582,
    image: W + 'en/9/99/Juspion_logo.jpg' },
  { playlist: '80', name: 'Capitaine Sheider', deezerId: 594252612,
    image: W + 'en/4/4f/ShaiderTitle.webp' },

  { playlist: '2000', name: 'Juliette je t\'aime', deezerId: 8134117,
    image: W + 'en/8/82/Maison_Ikkoku_Volume_1.jpg' },
  { playlist: '2000', name: 'Sailor Moon', deezerId: 96816986,
    image: W + 'en/e/e5/SMVolume1.jpg' },
  { playlist: '2000', name: 'Ranma ½', deezerId: 8134115,
    image: W + 'en/1/10/Ranma1_2volume1.jpg' },
  { playlist: '2000', name: 'Le Collège fou, fou, fou', deezerId: 97792168,
    image: W + 'en/e/e1/High_School%21_Kimengumi_manga_vol._1.png' },
  { playlist: '2000', name: 'Lamu', deezerId: 96808630,
    image: W + 'en/6/66/Urusei_Yatsura_volume_1_tankobon_cover.jpg' },
  { playlist: '2000', name: 'Georgie', deezerId: 96808642,
    image: W + 'en/e/e7/Georgie%21_manga_vol_1_reprint.jpg' },
  { playlist: '2000', name: 'Cherry Miel', deezerId: 96808646,
    image: W + 'en/4/4b/Cutie_Honey_manga_Shonen_Champion_volume_1_of_2.jpg' },
  { playlist: '2000', name: 'Docteur Slump', deezerId: 96808644,
    image: W + 'en/c/cd/DrSlump1.jpg' },
  { playlist: '2000', name: 'Les Attaquantes', deezerId: 96808626,
    image: W + 'en/e/e4/Attack_No._1_manga_vol_1.jpg' },
  { playlist: '2000', name: 'L\'École des champions', deezerId: 8134116,
    image: W + 'en/8/8c/Ganbare%2C_Kickers%21.jpeg' },
  { playlist: '2000', name: 'Mes tendres années', deezerId: 6473903,
    image: W + 'en/3/31/The_Kabocha_Wine.jpg' },
  { playlist: '2000', name: 'Cœur', deezerId: 6473911,
    image: W + 'en/0/0b/CuoreAnime.jpg' },
  { playlist: '2000', name: 'Jeu, set et match !', deezerId: 6473908,
    image: W + 'en/a/a1/Ace_wo_Nerae_volume_1_cover_by_Sumika_Yamamoto.png' },
  { playlist: '2000', name: 'Gu-Gu Ganmo', deezerId: 594252632,
    image: W + 'en/0/04/Gu_Gu_Ganmo_vol_1_cover.png' },
  { playlist: '2000', name: 'Adrien le sauveur du monde', deezerId: 594252782,
    image: W + 'en/4/44/SpiritHeroWataru1.jpg' },
  { playlist: '2000', name: 'Malicieuse Kiki', deezerId: 1560993532,
    image: W + 'en/8/8a/Hime-chan%27s_Ribbon_vol_1.jpg' },
  { playlist: '2000', name: 'Hélène et les Garçons', deezerId: 16558913 },
  { playlist: '2000', name: 'Premiers Baisers', deezerId: 99314696 },
  { playlist: '2000', name: 'Le Collège des cœurs brisés', deezerId: 6043264 },
  { playlist: '2000', name: 'Salut les musclés', deezerId: 627435252 },
]
