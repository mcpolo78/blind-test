// Liste des dessins animés du blind test.
// deezerId : identifiant du titre sur Deezer. L'extrait audio (30 s officielles)
// et la vignette (pochette) sont récupérés à la volée via l'API publique Deezer,
// car les liens d'extraits expirent au bout de quelques heures.
// coverAlbumId : album Deezer dont la pochette sert de vignette, quand l'album
// du titre est une compilation (pochette sans rapport avec le dessin animé).
// image: null : pas de pochette propre trouvée, le front affiche une tuile texte.
export const cartoons = [
  { name: 'Pokémon', deezerId: 84793863, coverAlbumId: 803245181 },
  { name: 'Dragon Ball', deezerId: 97642090, coverAlbumId: 1549498 },
  { name: 'Les Chevaliers du Zodiaque', deezerId: 8134110, coverAlbumId: 126484862 },
  { name: 'Goldorak', deezerId: 81670578 },
  { name: 'Capitaine Flam', deezerId: 66114627 },
  { name: 'Il était une fois la vie', deezerId: 1181039152 },
  { name: "Les Mystérieuses Cités d'or", deezerId: 81670594 },
  { name: 'Albator', deezerId: 38892081 },
  { name: 'Inspecteur Gadget', deezerId: 81670580 },
  { name: 'Candy', deezerId: 3744570 },
  { name: 'Olive et Tom', deezerId: 16978466, image: null },
  { name: 'Ulysse 31', deezerId: 81670602 },
  { name: 'Code Lyoko', deezerId: 617551662 },
  { name: 'Totally Spies', deezerId: 2466631945 },
  { name: 'Jayce et les conquérants de la lumière', deezerId: 81670582 },
  { name: 'Cobra', deezerId: 38892121 },
  { name: 'Nicky Larson', deezerId: 97792162, coverAlbumId: 87307292 },
  { name: 'Les Minipouss', deezerId: 81670592 },
  { name: 'One Piece', deezerId: 3033808841 },
]
