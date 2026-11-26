// Données de départ, copiées UNE SEULE FOIS en base au premier démarrage
// (tables playlists et tracks, voir db.js). Ensuite tout se gère depuis /admin :
// modifier ce fichier n'a plus d'effet sur une base déjà remplie.
// deezerId : identifiant du titre sur Deezer. L'extrait (30 s) est récupéré à la
// volée via l'API publique Deezer, car les liens d'extraits expirent.
// Vignette : image (URL fixe), sinon pochette de coverAlbumId, sinon pochette
// de l'album du titre.
// Les slugs '80' et '2000' reprennent les anciens modes « époque », pour que
// les scores et les liens de défi existants restent valables.
export const SEED_PLAYLISTS = [
  { slug: '80', name: 'Dessins animés 70-80' },
  { slug: '2000', name: 'Dessins animés 90-2000' },
]

const cartoons = [
  { name: 'Pokémon', deezerId: 84793863, era: '2000', coverAlbumId: 803245181 },
  {
    name: 'Dragon Ball',
    deezerId: 97642090,
    era: '80',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Dragon_Ball_anime_logo.png/250px-Dragon_Ball_anime_logo.png',
  },
  {
    name: 'Les Chevaliers du Zodiaque',
    deezerId: 8134110,
    era: '80',
    image: 'https://upload.wikimedia.org/wikipedia/en/7/75/Saint_Seiya_1.png',
  },
  { name: 'Goldorak', deezerId: 81670578, era: '80' },
  { name: 'Capitaine Flam', deezerId: 66114627, era: '80' },
  { name: 'Il était une fois la vie', deezerId: 1181039152, era: '80' },
  { name: "Les Mystérieuses Cités d'or", deezerId: 81670594, era: '80' },
  { name: 'Albator', deezerId: 38892081, era: '80' },
  { name: 'Inspecteur Gadget', deezerId: 81670580, era: '80' },
  { name: 'Candy', deezerId: 3744570, era: '80' },
  {
    name: 'Olive et Tom',
    deezerId: 16978466,
    era: '80',
    image: 'https://upload.wikimedia.org/wikipedia/en/0/09/Captain_Tsubasa_1.png',
  },
  { name: 'Ulysse 31', deezerId: 81670602, era: '80' },
  { name: 'Code Lyoko', deezerId: 617551662, era: '2000' },
  { name: 'Totally Spies', deezerId: 2466631945, era: '2000' },
  { name: 'Jayce et les conquérants de la lumière', deezerId: 81670582, era: '80' },
  { name: 'Cobra', deezerId: 38892121, era: '80' },
  { name: 'Nicky Larson', deezerId: 97792162, era: '80', coverAlbumId: 87307292 },
  { name: 'Les Minipouss', deezerId: 81670592, era: '80' },
  { name: 'One Piece', deezerId: 3033808841, era: '2000' },
  { name: 'Oggy et les Cafards', deezerId: 417705542, era: '2000' },
  { name: 'Martin Mystère', deezerId: 2466652595, era: '2000' },
  { name: 'Kim Possible', deezerId: 855956772, era: '2000' },
  { name: 'Galactik Football', deezerId: 5089082, era: '2000' },
  { name: 'Wakfu', deezerId: 1878987867, era: '2000' },
]


export const SEED_TRACKS = cartoons.map(({ era, ...t }) => ({ ...t, playlist: era }))
