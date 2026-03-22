import { Track, FogCatalog } from '@/types/lattice'

// Catalog of old Nigerian songs designed for memory recovery.
// Tags are semantic bridges between vague human memory and exact track identity.
// A human who says "that song about soldiers marching" should find Zombie.
// A human who says "the one with the talking drum at weddings" should find Juju classics.

export function createCatalog(): FogCatalog {
  return {
    tracks: [

      // ── VISIBLE AT START — 6 anchor tracks ──────────────────────────────

      {
        trackId: 'track-001',
        title: 'Zombie',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1977,
        cluster: 'fela',
        tags: ['soldiers', 'military', 'march', 'protest', 'brass', 'chant', 'lagos', '1970s', 'fela', 'political', 'horn', 'zombie'],
        visible: true,
        phiToReveal: 0,
      },

      {
        trackId: 'track-002',
        title: 'Sweet Mother',
        artist: 'Prince Nico Mbarga',
        genre: 'Highlife',
        year: 1976,
        cluster: 'highlife',
        tags: ['mother', 'love', 'family', 'sweet', 'gentle', 'guitar', 'highlife', '1970s', 'classic', 'wedding', 'church', 'emotional'],
        visible: true,
        phiToReveal: 0,
      },

      {
        trackId: 'track-003',
        title: 'Je Nlo',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1982,
        cluster: 'juju',
        tags: ['talking drum', 'juju', 'yoruba', 'dance', 'celebration', 'wedding', '1980s', 'guitar', 'percussion', 'sunny ade'],
        visible: true,
        phiToReveal: 0,
      },

      {
        trackId: 'track-004',
        title: 'Lady',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1972,
        cluster: 'fela',
        tags: ['woman', 'lady', 'feminist', 'brass', 'fela', '1970s', 'political', 'lagos', 'chant', 'horn', 'dance'],
        visible: true,
        phiToReveal: 0,
      },

      {
        trackId: 'track-005',
        title: 'Aki Special',
        artist: 'Celestine Ukwu',
        genre: 'Highlife',
        year: 1975,
        cluster: 'highlife',
        tags: ['highlife', 'igbo', '1970s', 'guitar', 'trumpet', 'palm wine', 'eastern nigeria', 'classic', 'dance', 'celebration'],
        visible: true,
        phiToReveal: 0,
      },

      {
        trackId: 'track-006',
        title: 'Yeke Yeke',
        artist: 'Shina Peters',
        genre: 'Afrojuju',
        year: 1989,
        cluster: 'afrojuju',
        tags: ['afrojuju', 'yoruba', 'dance', '1980s', 'energetic', 'party', 'percussion', 'shina peters', 'classic', 'radio'],
        visible: true,
        phiToReveal: 0,
      },

      // ── TIER 1 FOGGED — 15Φ ─────────────────────────────────────────────

      {
        trackId: 'track-007',
        title: 'Water No Get Enemy',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1975,
        cluster: 'fela',
        tags: ['water', 'proverb', 'wisdom', 'fela', 'brass', '1970s', 'lagos', 'chant', 'philosophical', 'horn', 'long'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-008',
        title: 'Synchro System',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1983,
        cluster: 'juju',
        tags: ['juju', 'talking drum', 'yoruba', '1980s', 'sunny ade', 'international', 'dance', 'guitar', 'celebration', 'wedding'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-009',
        title: 'Expensive Shit',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1975,
        cluster: 'fela',
        tags: ['protest', 'police', 'political', 'fela', 'brass', '1970s', 'lagos', 'corruption', 'horn', 'defiant', 'chant'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-010',
        title: 'Joromi',
        artist: 'Sir Victor Uwaifo',
        genre: 'Highlife',
        year: 1969,
        cluster: 'highlife',
        tags: ['joromi', 'supernatural', 'mamiwater', 'mysterious', '1960s', 'guitar', 'benin', 'classic', 'legend', 'folk'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-011',
        title: 'Omo Pupa',
        artist: 'Ebenezer Obey',
        genre: 'Jùjú',
        year: 1980,
        cluster: 'juju',
        tags: ['juju', 'yoruba', 'love', '1980s', 'obey', 'talking drum', 'guitar', 'wedding', 'praise', 'gentle'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-012',
        title: 'Shakara',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1972,
        cluster: 'fela',
        tags: ['woman', 'attitude', 'fela', 'brass', '1970s', 'lagos', 'chant', 'horn', 'dance', 'political', 'proud'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-013',
        title: 'Palmwine Drinkard',
        artist: 'Rex Lawson',
        genre: 'Highlife',
        year: 1970,
        cluster: 'highlife',
        tags: ['palm wine', 'highlife', 'rivers state', '1970s', 'guitar', 'classic', 'folk', 'eastern', 'kalabari', 'gentle'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-014',
        title: 'Confusion Break Bones',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1990,
        cluster: 'fela',
        tags: ['confusion', 'political', 'protest', 'fela', 'brass', '1990s', 'lagos', 'horn', 'chant', 'anger', 'defiant'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-015',
        title: 'Orere Elejigbo',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1975,
        cluster: 'juju',
        tags: ['juju', 'yoruba', 'talking drum', '1970s', 'sunny ade', 'traditional', 'spiritual', 'praise', 'guitar'],
        visible: false,
        phiToReveal: 15,
      },

      {
        trackId: 'track-016',
        title: 'Love Thy Neighbour',
        artist: 'Bobby Benson',
        genre: 'Highlife',
        year: 1960,
        cluster: 'highlife',
        tags: ['love', 'neighbour', 'highlife', '1960s', 'classic', 'bobby benson', 'brass', 'old school', 'gentle', 'moral'],
        visible: false,
        phiToReveal: 15,
      },

      // ── TIER 2 FOGGED — 20Φ ─────────────────────────────────────────────

      {
        trackId: 'track-017',
        title: 'Iwe Mimo',
        artist: 'Ebenezer Obey',
        genre: 'Jùjú',
        year: 1975,
        cluster: 'juju',
        tags: ['gospel', 'bible', 'spiritual', 'yoruba', 'juju', '1970s', 'obey', 'talking drum', 'church', 'prayer', 'sacred'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-018',
        title: 'Aare Agba',
        artist: 'Sikiru Ayinde Barrister',
        genre: 'Fuji',
        year: 1988,
        cluster: 'fuji',
        tags: ['fuji', 'yoruba', '1980s', 'barrister', 'percussion', 'praise', 'energetic', 'islamic', 'dundun', 'party'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-019',
        title: 'International Thief Thief',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1980,
        cluster: 'fela',
        tags: ['corruption', 'theft', 'political', 'fela', 'brass', '1980s', 'lagos', 'horn', 'protest', 'angry', 'chant', 'itf'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-020',
        title: 'Omo Alhaji',
        artist: 'Haruna Ishola',
        genre: 'Apala',
        year: 1972,
        cluster: 'apala',
        tags: ['apala', 'yoruba', '1970s', 'islamic', 'percussion', 'traditional', 'haruna ishola', 'praise', 'drum'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-021',
        title: 'Eko Ile',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1978,
        cluster: 'juju',
        tags: ['lagos', 'home', 'nostalgia', 'juju', 'yoruba', '1970s', 'sunny ade', 'talking drum', 'guitar', 'longing'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-022',
        title: 'Abami Eda',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1981,
        cluster: 'fela',
        tags: ['mysterious', 'unusual', 'fela', 'brass', '1980s', 'lagos', 'horn', 'spiritual', 'chant', 'identity'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-023',
        title: 'Obangiji',
        artist: 'Ebenezer Obey',
        genre: 'Jùjú',
        year: 1983,
        cluster: 'juju',
        tags: ['god', 'spiritual', 'yoruba', 'juju', '1980s', 'obey', 'talking drum', 'guitar', 'prayer', 'devotion'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-024',
        title: 'Baby Mi Jowo',
        artist: 'I.K. Dairo',
        genre: 'Jùjú',
        year: 1965,
        cluster: 'juju',
        tags: ['love', 'baby', 'juju', 'yoruba', '1960s', 'ik dairo', 'accordion', 'classic', 'old school', 'pleading'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-025',
        title: 'Yellow Fever',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1976,
        cluster: 'fela',
        tags: ['bleaching', 'skin', 'social', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'commentary', 'dance'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-026',
        title: 'Erin Mi',
        artist: 'Ayinla Omowura',
        genre: 'Apala',
        year: 1975,
        cluster: 'apala',
        tags: ['apala', 'yoruba', '1970s', 'percussion', 'traditional', 'praise', 'omowura', 'drum', 'storytelling'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-027',
        title: 'Mr. Grammanticus',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1975,
        cluster: 'fela',
        tags: ['education', 'colonial', 'satire', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'language', 'funny'],
        visible: false,
        phiToReveal: 20,
      },

      {
        trackId: 'track-028',
        title: 'Fuji Garbage',
        artist: 'Ayinde Wasiu',
        genre: 'Fuji',
        year: 1990,
        cluster: 'fuji',
        tags: ['fuji', 'yoruba', '1990s', 'wasiu', 'percussion', 'energetic', 'party', 'dundun', 'talking drum'],
        visible: false,
        phiToReveal: 20,
      },

      // ── TIER 3 FOGGED — 25Φ ─────────────────────────────────────────────

      {
        trackId: 'track-029',
        title: 'Noise for Vendor Mouth',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1975,
        cluster: 'fela',
        tags: ['market', 'women', 'commerce', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'social', 'noise'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-030',
        title: 'Mo Tere',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1985,
        cluster: 'juju',
        tags: ['juju', 'yoruba', 'talking drum', '1980s', 'sunny ade', 'love', 'guitar', 'wedding', 'celebration'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-031',
        title: 'Sorrow Tears and Blood',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1977,
        cluster: 'fela',
        tags: ['sorrow', 'pain', 'political', 'fela', 'brass', '1970s', 'lagos', 'horn', 'grief', 'protest', 'military'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-032',
        title: 'Taxation',
        artist: 'Bobby Benson',
        genre: 'Highlife',
        year: 1963,
        cluster: 'highlife',
        tags: ['tax', 'government', 'highlife', '1960s', 'bobby benson', 'brass', 'humour', 'satire', 'old school'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-033',
        title: 'Awa Ko Ja Bo',
        artist: 'Ebenezer Obey',
        genre: 'Jùjú',
        year: 1976,
        cluster: 'juju',
        tags: ['juju', 'yoruba', '1970s', 'obey', 'talking drum', 'guitar', 'praise', 'traditional', 'wisdom'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-034',
        title: 'O Pari',
        artist: 'Sikiru Ayinde Barrister',
        genre: 'Fuji',
        year: 1985,
        cluster: 'fuji',
        tags: ['fuji', 'yoruba', '1980s', 'barrister', 'percussion', 'energetic', 'dundun', 'party', 'wedding'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-035',
        title: 'Suffering and Smiling',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1977,
        cluster: 'fela',
        tags: ['suffering', 'endurance', 'religion', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'church', 'mosque', 'political'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-036',
        title: 'Onile Gogoro',
        artist: 'I.K. Dairo',
        genre: 'Jùjú',
        year: 1968,
        cluster: 'juju',
        tags: ['tall building', 'city', 'juju', 'yoruba', '1960s', 'ik dairo', 'accordion', 'classic', 'urban', 'modern'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-037',
        title: 'Colonial Mentality',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1977,
        cluster: 'fela',
        tags: ['colonialism', 'identity', 'africa', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'political', 'pride'],
        visible: false,
        phiToReveal: 25,
      },

      {
        trackId: 'track-038',
        title: 'Bitter Leaf',
        artist: 'Rex Lawson',
        genre: 'Highlife',
        year: 1968,
        cluster: 'highlife',
        tags: ['bitter', 'leaf', 'highlife', '1960s', 'rex lawson', 'guitar', 'rivers', 'eastern', 'folk', 'proverb'],
        visible: false,
        phiToReveal: 25,
      },

      // ── TIER 4 FOGGED — 30Φ — rarest finds ──────────────────────────────

      {
        trackId: 'track-039',
        title: 'Army Arrangement',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1985,
        cluster: 'fela',
        tags: ['military', 'army', 'political', 'fela', 'brass', '1980s', 'lagos', 'horn', 'chant', 'soldiers', 'corruption'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-040',
        title: 'Ajo',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1990,
        cluster: 'juju',
        tags: ['travel', 'journey', 'nostalgia', 'juju', 'yoruba', '1990s', 'sunny ade', 'talking drum', 'longing', 'home'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-041',
        title: 'Upside Down',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1976,
        cluster: 'fela',
        tags: ['chaos', 'disorder', 'political', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'confusion'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-042',
        title: 'Opobiyi',
        artist: 'Haruna Ishola',
        genre: 'Apala',
        year: 1965,
        cluster: 'apala',
        tags: ['apala', 'yoruba', '1960s', 'haruna ishola', 'percussion', 'traditional', 'praise', 'old school', 'rare'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-043',
        title: 'Cross Examination',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1980,
        cluster: 'fela',
        tags: ['law', 'justice', 'political', 'fela', 'brass', '1980s', 'lagos', 'horn', 'chant', 'court', 'satire'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-044',
        title: 'Board Members',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1984,
        cluster: 'fela',
        tags: ['corruption', 'business', 'political', 'fela', 'brass', '1980s', 'lagos', 'horn', 'chant', 'corporate'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-045',
        title: 'Olurombi',
        artist: 'I.K. Dairo',
        genre: 'Jùjú',
        year: 1962,
        cluster: 'juju',
        tags: ['sacrifice', 'folk', 'yoruba', 'legend', '1960s', 'ik dairo', 'accordion', 'traditional', 'rare', 'spiritual'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-046',
        title: 'Overtake Don Overtake Overtake',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1990,
        cluster: 'fela',
        tags: ['progress', 'race', 'political', 'fela', 'brass', '1990s', 'lagos', 'horn', 'chant', 'competition', 'late fela'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-047',
        title: 'Mushin Cannot Quench It',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1982,
        cluster: 'juju',
        tags: ['mushin', 'lagos', 'neighbourhood', 'juju', 'yoruba', '1980s', 'sunny ade', 'talking drum', 'urban', 'local'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-048',
        title: 'Gbagada Gbagada Gbogodo',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1972,
        cluster: 'fela',
        tags: ['dance', 'rhythm', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'early fela', 'energetic'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-049',
        title: 'Eda Ko Le Foi Eda',
        artist: 'Ayinla Omowura',
        genre: 'Apala',
        year: 1978,
        cluster: 'apala',
        tags: ['human nature', 'wisdom', 'apala', 'yoruba', '1970s', 'omowura', 'percussion', 'philosophical', 'proverb'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-050',
        title: 'J.J.D.',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1977,
        cluster: 'fela',
        tags: ['diaspora', 'foreign', 'returnee', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'identity', 'abroad'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-051',
        title: 'Ilu Orun',
        artist: 'Ebenezer Obey',
        genre: 'Jùjú',
        year: 1988,
        cluster: 'juju',
        tags: ['heaven', 'afterlife', 'spiritual', 'yoruba', 'juju', '1980s', 'obey', 'talking drum', 'gospel', 'prayer', 'eternal'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-052',
        title: 'Beasts of No Nation',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1989,
        cluster: 'fela',
        tags: ['politics', 'world leaders', 'africa', 'fela', 'brass', '1980s', 'lagos', 'horn', 'chant', 'international', 'late fela'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-053',
        title: 'Adawa',
        artist: 'Haruna Ishola',
        genre: 'Apala',
        year: 1970,
        cluster: 'apala',
        tags: ['apala', 'yoruba', '1970s', 'haruna ishola', 'percussion', 'traditional', 'drum', 'praise', 'rare'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-054',
        title: 'Original Suffer Head',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1981,
        cluster: 'fela',
        tags: ['poverty', 'suffering', 'political', 'fela', 'brass', '1980s', 'lagos', 'horn', 'chant', 'hardship', 'struggle'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-055',
        title: 'Ile Ijo',
        artist: 'King Sunny Ade',
        genre: 'Jùjú',
        year: 1979,
        cluster: 'juju',
        tags: ['church', 'house of worship', 'spiritual', 'juju', 'yoruba', '1970s', 'sunny ade', 'talking drum', 'devotion'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-056',
        title: 'Na Poi',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1972,
        cluster: 'fela',
        tags: ['early fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'dance', 'energetic', 'classic'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-057',
        title: 'Tani Olohun',
        artist: 'Ayinla Omowura',
        genre: 'Apala',
        year: 1973,
        cluster: 'apala',
        tags: ['god', 'who is god', 'philosophical', 'apala', 'yoruba', '1970s', 'omowura', 'percussion', 'spiritual', 'deep'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-058',
        title: 'Shuffering and Shmiling',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1978,
        cluster: 'fela',
        tags: ['religion', 'church', 'mosque', 'suffering', 'fela', 'brass', '1970s', 'lagos', 'horn', 'chant', 'satire', 'spiritual'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-059',
        title: 'Ma Roko',
        artist: 'Ebenezer Obey',
        genre: 'Jùjú',
        year: 1970,
        cluster: 'juju',
        tags: ['advice', 'wisdom', 'yoruba', 'juju', '1970s', 'obey', 'talking drum', 'guitar', 'moral', 'proverb'],
        visible: false,
        phiToReveal: 30,
      },

      {
        trackId: 'track-060',
        title: 'Authority Stealing',
        artist: 'Fela Kuti',
        genre: 'Afrobeat',
        year: 1980,
        cluster: 'fela',
        tags: ['corruption', 'stealing', 'government', 'fela', 'brass', '1980s', 'lagos', 'horn', 'chant', 'political', 'theft'],
        visible: false,
        phiToReveal: 30,
      },
    ]
  }
}

export function getVisibleTracks(catalog: FogCatalog): Track[] {
  return catalog.tracks.filter(t => t.visible)
}

export function getFoggedTracks(catalog: FogCatalog): Track[] {
  return catalog.tracks.filter(t => !t.visible)
}

export function getTrackById(
  catalog: FogCatalog,
  trackId: string
): Track | null {
  return catalog.tracks.find(t => t.trackId === trackId) ?? null
}

export function revealTrack(
  catalog: FogCatalog,
  trackId: string
): boolean {
  const track = catalog.tracks.find(t => t.trackId === trackId)
  if (!track) return false
  if (track.visible) return false
  track.visible = true
  return true
}