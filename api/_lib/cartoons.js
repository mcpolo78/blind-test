// Liste de base des dessins animés du blind test (d'autres peuvent être
// ajoutés depuis /admin, ils sont alors stockés en base).
// deezerId : identifiant du titre sur Deezer. L'extrait audio (30 s officielles)
// est récupéré à la volée via l'API publique Deezer, car les liens d'extraits
// expirent au bout de quelques heures.
// era : '80' (années 70-80) ou '2000' (années 90-2000), pour le mode par époque.
// Vignette, par ordre de priorité :
//   image : URL d'image fixe (ou null pour afficher une tuile 🎬) ;
//   coverAlbumId : album Deezer dont la pochette sert de vignette, quand l'album
//   du titre est une compilation ;
//   sinon la pochette de l'album du titre.
export const cartoons = [
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

export const ERAS = ['80', '2000']
