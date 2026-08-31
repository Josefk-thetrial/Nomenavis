import type { Figure, WaveConfig } from "./types";

export const FIGURES: Figure[] = [
  { name: "Platão", era: "antigo", hint: "Filósofo grego da República" },
  { name: "César", era: "antigo", hint: "General e ditador de Roma" },
  { name: "Homero", era: "antigo", hint: "Poeta da Ilíada e da Odisseia" },
  { name: "Safo", era: "antigo", hint: "Poetisa de Lesbos" },
  { name: "Buda", era: "antigo", hint: "Fundador do budismo" },
  { name: "Nero", era: "antigo", hint: "Imperador romano" },
  { name: "Dante", era: "medieval", hint: "Autor da Divina Comédia" },
  { name: "Bach", era: "moderno", hint: "Compositor do barroco alemão" },
  { name: "Marx", era: "moderno", hint: "Filósofo de O Capital" },
  { name: "Freud", era: "moderno", hint: "Pai da psicanálise" },
  { name: "Kafka", era: "moderno", hint: "Autor de A Metamorfose" },
  { name: "Tesla", era: "moderno", hint: "Inventor da corrente alternada" },
  { name: "Pelé", era: "contemporaneo", hint: "Rei do futebol brasileiro" },
  { name: "Goya", era: "moderno", hint: "Pintor espanhol" },
  { name: "Rumi", era: "medieval", hint: "Poeta místico persa" },
  { name: "Zumbi", era: "moderno", hint: "Líder do Quilombo dos Palmares" },
  { name: "Senna", era: "contemporaneo", hint: "Tricampeão de Fórmula 1" },
  { name: "Pessoa", era: "moderno", hint: "Poeta dos heterônimos" },
  { name: "Camões", era: "moderno", hint: "Autor de Os Lusíadas" },
  { name: "Newton", era: "moderno", hint: "Leis do movimento e gravidade" },
  { name: "Darwin", era: "moderno", hint: "Teoria da evolução" },
  { name: "Mozart", era: "moderno", hint: "Compositor clássico austríaco" },
  { name: "Galileu", era: "moderno", hint: "Astrônomo do telescópio" },
  { name: "Turing", era: "contemporaneo", hint: "Pioneiro da computação" },
  { name: "Kepler", era: "moderno", hint: "Leis do movimento planetário" },
  { name: "Mendel", era: "moderno", hint: "Pai da genética" },
  { name: "Edison", era: "moderno", hint: "Inventor da lâmpada prática" },
  { name: "Pasteur", era: "moderno", hint: "Vacinas e pasteurização" },
  { name: "Voltaire", era: "moderno", hint: "Filósofo do Iluminismo" },
  { name: "Gandhi", era: "contemporaneo", hint: "Resistência pacífica na Índia" },
  { name: "Mandela", era: "contemporaneo", hint: "Fim do apartheid na África do Sul" },
  { name: "Einstein", era: "contemporaneo", hint: "Relatividade e E=mc²" },
  { name: "Napoleão", era: "moderno", hint: "Imperador da França" },
  { name: "Cleópatra", era: "antigo", hint: "Última rainha do Egito ptolemaico" },
  { name: "Sócrates", era: "antigo", hint: "Filósofo do diálogo ateniense" },
  { name: "Confúcio", era: "antigo", hint: "Sábio da ética chinesa" },
  { name: "Faraday", era: "moderno", hint: "Eletromagnetismo" },
  { name: "Lincoln", era: "moderno", hint: "Presidente da abolição nos EUA" },
  { name: "Hawking", era: "contemporaneo", hint: "Buracos negros e cosmologia" },
  { name: "Beethoven", era: "moderno", hint: "Sinfonias do classicismo ao romantismo" },
  { name: "Hipátia", era: "antigo", hint: "Matemática de Alexandria" },
  { name: "Pitágoras", era: "antigo", hint: "Teorema dos triângulos" },
  { name: "Arquimedes", era: "antigo", hint: "Princípio do empuxo" },
  { name: "Euclides", era: "antigo", hint: "Elementos da geometria" },
  { name: "Aristóteles", era: "antigo", hint: "Filósofo da lógica e da natureza" },
  { name: "Alexandre", era: "antigo", hint: "Conquistador da Macedônia" },
  { name: "Hatshepsut", era: "antigo", hint: "Faraó mulher do Egito" },
  { name: "Tutancâmon", era: "antigo", hint: "Faraó da tumba intacta" },
  { name: "Copérnico", era: "moderno", hint: "Heliocentrismo" },
  { name: "Shakespeare", era: "moderno", hint: "Hamlet, Romeu e Julieta" },
  { name: "Cervantes", era: "moderno", hint: "Dom Quixote" },
  { name: "Vivaldi", era: "moderno", hint: "As Quatro Estações" },
  { name: "Chopin", era: "moderno", hint: "Noturnos para piano" },
  { name: "Debussy", era: "moderno", hint: "Impressionismo musical" },
  { name: "Tolstói", era: "moderno", hint: "Guerra e Paz" },
  { name: "Hemingway", era: "contemporaneo", hint: "O Velho e o Mar" },
  { name: "Tiradentes", era: "moderno", hint: "Inconfidência Mineira" },
  { name: "Gutenberg", era: "medieval", hint: "Prensa de tipos móveis" },
  { name: "Avicena", era: "medieval", hint: "Cânone da medicina" },
  { name: "Saladin", era: "medieval", hint: "Sultão das Cruzadas" },
  { name: "Joana dArc", era: "medieval", hint: "Donzela de Orléans" },
  { name: "Magalhães", era: "moderno", hint: "Primeira circum-navegação" },
  { name: "Cabral", era: "moderno", hint: "Chegada portuguesa ao Brasil" },
  { name: "Colombo", era: "moderno", hint: "Travessia do Atlântico em 1492" },
  { name: "Rembrandt", era: "moderno", hint: "Mestre do claro-escuro" },
  { name: "Velázquez", era: "moderno", hint: "Las Meninas" },
  { name: "Caravaggio", era: "moderno", hint: "Pintura barroca dramática" },
  { name: "Donatello", era: "medieval", hint: "Escultor do Renascimento" },
  { name: "Botticelli", era: "medieval", hint: "O Nascimento de Vênus" },
  { name: "Raffaello", era: "moderno", hint: "Escola de Atenas" },
  { name: "Tchaikovsky", era: "moderno", hint: "O Lago dos Cisnes" },
  { name: "Stravinsky", era: "contemporaneo", hint: "A Sagração da Primavera" },
  { name: "Niemeyer", era: "contemporaneo", hint: "Arquiteto de Brasília" },
  { name: "Drummond", era: "contemporaneo", hint: "Poeta de Itabira" },
  { name: "Villa-Lobos", era: "contemporaneo", hint: "Bachianas brasileiras" },
  { name: "Marie Curie", era: "moderno", hint: "Rádio, polônio e dois Nobéis" },
  { name: "Ada Lovelace", era: "moderno", hint: "Primeiro algoritmo de máquina" },
  { name: "Santos Dumont", era: "moderno", hint: "Pioneiro da aviação" },
  { name: "Frida Kahlo", era: "contemporaneo", hint: "Autorretratos mexicanos" },
  { name: "Ayrton Senna", era: "contemporaneo", hint: "Tricampeão mundial de F1" },
  { name: "Nelson Mandela", era: "contemporaneo", hint: "Nobel da Paz e liberdade" },
  { name: "Isaac Newton", era: "moderno", hint: "Principia Mathematica" },
  { name: "Alan Turing", era: "contemporaneo", hint: "Máquina de Turing e Enigma" },
  { name: "Van Gogh", era: "moderno", hint: "Noite Estrelada" },
  { name: "Picasso", era: "contemporaneo", hint: "Cubismo e Guernica" },
  { name: "Machado de Assis", era: "moderno", hint: "Dom Casmurro e o Bruxo do Cosme Velho" },
  { name: "Leonardo da Vinci", era: "moderno", hint: "Mona Lisa, inventor e anatomista" },
  { name: "Michelangelo", era: "moderno", hint: "Teto da Capela Sistina" },
  { name: "Clarice Lispector", era: "contemporaneo", hint: "A Hora da Estrela" },
  { name: "Florence Nightingale", era: "moderno", hint: "Fundadora da enfermagem moderna" },
  { name: "Amelia Earhart", era: "contemporaneo", hint: "Pioneira da aviação" },
  { name: "Neil Armstrong", era: "contemporaneo", hint: "Primeiro homem na Lua" },
  { name: "Princesa Isabel", era: "moderno", hint: "Lei Áurea no Brasil" },
  { name: "Anita Garibaldi", era: "moderno", hint: "Heroína da Farroupilha" },
  { name: "Maria Quitéria", era: "moderno", hint: "Soldado da independência" },
  { name: "Chico Mendes", era: "contemporaneo", hint: "Defensor da Amazônia" },
  { name: "Oscar Niemeyer", era: "contemporaneo", hint: "Curvas de concreto de Brasília" },
  { name: "Castro Alves", era: "moderno", hint: "Poeta dos escravos" },
  { name: "José de Alencar", era: "moderno", hint: "Iracema e o indianismo" },
  { name: "Sun Tzu", era: "antigo", hint: "A Arte da Guerra" },
  { name: "Heródoto", era: "antigo", hint: "Pai da história" },
  { name: "Tucídides", era: "antigo", hint: "Guerra do Peloponeso" },
  { name: "Marco Polo", era: "medieval", hint: "Viagens à Ásia" },
  { name: "Ibn Battuta", era: "medieval", hint: "Viajante do mundo islâmico" },
  { name: "Mansa Musa", era: "medieval", hint: "Imperador de Mali" },
  { name: "Gengis Khan", era: "medieval", hint: "Império Mongol" },
  { name: "Isabel I", era: "moderno", hint: "Rainha da era elisabetana" },
  { name: "Pedro II", era: "moderno", hint: "Último imperador do Brasil" },
  { name: "Dandara", era: "moderno", hint: "Guerreira de Palmares" },
  { name: "Tarsila", era: "contemporaneo", hint: "Abaporu e o modernismo" },
  { name: "Portinari", era: "contemporaneo", hint: "Guerra e Paz no ONU" },
  { name: "Cora Coralina", era: "contemporaneo", hint: "Poetisa de Goiás" },
  { name: "Cecília Meireles", era: "contemporaneo", hint: "Romanceiro da Inconfidência" },
  { name: "Santos", era: "moderno", hint: "Alberto Santos Dumont" },
];

export function waveConfig(wave: number): WaveConfig {
  const w = Math.max(1, wave);
  return {
    maxShips: Math.min(2 + Math.floor((w - 1) / 2), 5),
    speed: 28 + w * 6,
    spawnInterval: Math.max(0.75, 2.6 - w * 0.12),
    minLen: w < 3 ? 3 : w < 6 ? 4 : 5,
    maxLen: w < 2 ? 6 : w < 4 ? 8 : w < 7 ? 12 : 22,
    allowSpaces: w >= 4,
    quota: 6 + w * 2,
  };
}

export function normalizeChar(ch: string): string {
  return ch.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function charsMatch(input: string, expected: string): boolean {
  return normalizeChar(input) === normalizeChar(expected);
}

export function firstLetter(name: string): string {
  return normalizeChar(name[0] ?? "");
}

export function pickFigure(
  wave: number,
  used: Set<string>,
  blockedFirst: Set<string>,
): Figure | null {
  const cfg = waveConfig(wave);
  const fits = (f: Figure, relaxFirst: boolean, relaxUsed: boolean, relaxLen: boolean) => {
    const L = f.name.length;
    if (!relaxLen && (L < cfg.minLen || L > cfg.maxLen)) return false;
    if (!cfg.allowSpaces && f.name.includes(" ")) return false;
    if (!relaxUsed && used.has(f.name)) return false;
    if (!relaxFirst && blockedFirst.has(firstLetter(f.name))) return false;
    return true;
  };

  const tryPool = (relaxFirst: boolean, relaxUsed: boolean, relaxLen: boolean) =>
    FIGURES.filter((f) => fits(f, relaxFirst, relaxUsed, relaxLen));

  let pool = tryPool(false, false, false);
  if (pool.length === 0) pool = tryPool(false, true, false);
  if (pool.length === 0) pool = tryPool(true, true, false);
  if (pool.length === 0) pool = tryPool(true, true, true);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
