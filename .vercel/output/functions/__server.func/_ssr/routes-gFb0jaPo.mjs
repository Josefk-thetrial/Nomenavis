import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Pause, i as Trophy, l as BookOpen, n as VolumeX, o as RotateCcw, r as Volume2, s as Play, t as X } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-gFb0jaPo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function load(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
}
async function loadSprites() {
	const [player, scarab, saucer, dart, bg] = await Promise.all([
		load("/sprites/player.png"),
		load("/sprites/alien-scarab.png"),
		load("/sprites/alien-saucer.png"),
		load("/sprites/alien-dart.png"),
		load("/bg/starchart.jpg")
	]);
	return {
		player,
		aliens: [
			scarab,
			saucer,
			dart
		],
		bg
	};
}
var GameAudio = class {
	ctx = null;
	master = null;
	sfx = null;
	music = null;
	muted = false;
	drone = [];
	droneGain = null;
	unlock() {
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			this.ctx = new Ctx({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.sfx = this.ctx.createGain();
			this.music = this.ctx.createGain();
			this.sfx.gain.value = .28;
			this.music.gain.value = .07;
			this.master.gain.value = this.muted ? 0 : 1;
			this.sfx.connect(this.master);
			this.music.connect(this.master);
			this.master.connect(this.ctx.destination);
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(muted) {
		this.muted = muted;
		if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, .03);
	}
	resume() {
		if (this.ctx?.state === "suspended") this.ctx.resume();
	}
	env(duration, peak, attack = .008) {
		if (!this.ctx || !this.sfx) return null;
		const g = this.ctx.createGain();
		const t = this.ctx.currentTime;
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(peak, t + attack);
		g.gain.exponentialRampToValueAtTime(1e-4, t + duration);
		g.connect(this.sfx);
		return g;
	}
	tone(freq, duration, type, peak, detune = 0) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		osc.type = type;
		osc.frequency.value = freq * (1 + (Math.random() * 2 - 1) * .03);
		osc.detune.value = detune;
		const g = this.env(duration, peak);
		if (!g) return;
		osc.connect(g);
		osc.start();
		osc.stop(this.ctx.currentTime + duration + .02);
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
		};
	}
	type() {
		this.tone(880 + Math.random() * 80, .05, "square", .12);
	}
	lock() {
		this.tone(520, .08, "triangle", .16);
		this.tone(780, .1, "sine", .08);
	}
	laser() {
		if (!this.ctx || !this.sfx) return;
		const osc = this.ctx.createOscillator();
		osc.type = "sawtooth";
		const t = this.ctx.currentTime;
		osc.frequency.setValueAtTime(920, t);
		osc.frequency.exponentialRampToValueAtTime(240, t + .09);
		const g = this.env(.1, .1, .004);
		if (!g) return;
		osc.connect(g);
		osc.start();
		osc.stop(t + .12);
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
		};
	}
	explode() {
		if (!this.ctx || !this.sfx) return;
		const t = this.ctx.currentTime;
		const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * .28, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
		const src = this.ctx.createBufferSource();
		src.buffer = buffer;
		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(1800, t);
		filter.frequency.exponentialRampToValueAtTime(220, t + .25);
		const g = this.env(.28, .45, .004);
		if (!g) return;
		src.connect(filter);
		filter.connect(g);
		src.start();
		src.stop(t + .3);
		src.onended = () => {
			src.disconnect();
			filter.disconnect();
			g.disconnect();
		};
		this.tone(140, .22, "sine", .2);
	}
	miss() {
		this.tone(180, .12, "square", .1);
		this.tone(160, .14, "sawtooth", .06);
	}
	wave() {
		this.tone(392, .22, "triangle", .12);
		this.tone(588, .28, "sine", .08);
	}
	gameOver() {
		this.tone(330, .25, "triangle", .14);
		this.tone(247, .4, "sine", .12);
		this.tone(196, .55, "sine", .1);
	}
	startDrone() {
		if (!this.ctx || !this.music || this.drone.length) return;
		const g = this.ctx.createGain();
		g.gain.value = 1e-4;
		g.connect(this.music);
		this.droneGain = g;
		for (const f of [
			110,
			164.81,
			246
		]) {
			const osc = this.ctx.createOscillator();
			osc.type = "sine";
			osc.frequency.value = f;
			osc.connect(g);
			osc.start();
			this.drone.push(osc);
		}
		g.gain.exponentialRampToValueAtTime(1, this.ctx.currentTime + 1.2);
	}
	stopDrone() {
		if (!this.ctx || !this.droneGain) return;
		const g = this.droneGain;
		g.gain.setTargetAtTime(1e-4, this.ctx.currentTime, .2);
		const nodes = [...this.drone];
		this.drone = [];
		this.droneGain = null;
		window.setTimeout(() => {
			for (const n of nodes) try {
				n.stop();
				n.disconnect();
			} catch {}
			g.disconnect();
		}, 600);
	}
};
var FIGURES = [
	{
		name: "Platão",
		era: "antigo",
		hint: "Filósofo grego da República"
	},
	{
		name: "César",
		era: "antigo",
		hint: "General e ditador de Roma"
	},
	{
		name: "Homero",
		era: "antigo",
		hint: "Poeta da Ilíada e da Odisseia"
	},
	{
		name: "Safo",
		era: "antigo",
		hint: "Poetisa de Lesbos"
	},
	{
		name: "Buda",
		era: "antigo",
		hint: "Fundador do budismo"
	},
	{
		name: "Nero",
		era: "antigo",
		hint: "Imperador romano"
	},
	{
		name: "Dante",
		era: "medieval",
		hint: "Autor da Divina Comédia"
	},
	{
		name: "Bach",
		era: "moderno",
		hint: "Compositor do barroco alemão"
	},
	{
		name: "Marx",
		era: "moderno",
		hint: "Filósofo de O Capital"
	},
	{
		name: "Freud",
		era: "moderno",
		hint: "Pai da psicanálise"
	},
	{
		name: "Kafka",
		era: "moderno",
		hint: "Autor de A Metamorfose"
	},
	{
		name: "Tesla",
		era: "moderno",
		hint: "Inventor da corrente alternada"
	},
	{
		name: "Pelé",
		era: "contemporaneo",
		hint: "Rei do futebol brasileiro"
	},
	{
		name: "Goya",
		era: "moderno",
		hint: "Pintor espanhol"
	},
	{
		name: "Rumi",
		era: "medieval",
		hint: "Poeta místico persa"
	},
	{
		name: "Zumbi",
		era: "moderno",
		hint: "Líder do Quilombo dos Palmares"
	},
	{
		name: "Senna",
		era: "contemporaneo",
		hint: "Tricampeão de Fórmula 1"
	},
	{
		name: "Pessoa",
		era: "moderno",
		hint: "Poeta dos heterônimos"
	},
	{
		name: "Camões",
		era: "moderno",
		hint: "Autor de Os Lusíadas"
	},
	{
		name: "Newton",
		era: "moderno",
		hint: "Leis do movimento e gravidade"
	},
	{
		name: "Darwin",
		era: "moderno",
		hint: "Teoria da evolução"
	},
	{
		name: "Mozart",
		era: "moderno",
		hint: "Compositor clássico austríaco"
	},
	{
		name: "Galileu",
		era: "moderno",
		hint: "Astrônomo do telescópio"
	},
	{
		name: "Turing",
		era: "contemporaneo",
		hint: "Pioneiro da computação"
	},
	{
		name: "Kepler",
		era: "moderno",
		hint: "Leis do movimento planetário"
	},
	{
		name: "Mendel",
		era: "moderno",
		hint: "Pai da genética"
	},
	{
		name: "Edison",
		era: "moderno",
		hint: "Inventor da lâmpada prática"
	},
	{
		name: "Pasteur",
		era: "moderno",
		hint: "Vacinas e pasteurização"
	},
	{
		name: "Voltaire",
		era: "moderno",
		hint: "Filósofo do Iluminismo"
	},
	{
		name: "Gandhi",
		era: "contemporaneo",
		hint: "Resistência pacífica na Índia"
	},
	{
		name: "Mandela",
		era: "contemporaneo",
		hint: "Fim do apartheid na África do Sul"
	},
	{
		name: "Einstein",
		era: "contemporaneo",
		hint: "Relatividade e E=mc²"
	},
	{
		name: "Napoleão",
		era: "moderno",
		hint: "Imperador da França"
	},
	{
		name: "Cleópatra",
		era: "antigo",
		hint: "Última rainha do Egito ptolemaico"
	},
	{
		name: "Sócrates",
		era: "antigo",
		hint: "Filósofo do diálogo ateniense"
	},
	{
		name: "Confúcio",
		era: "antigo",
		hint: "Sábio da ética chinesa"
	},
	{
		name: "Faraday",
		era: "moderno",
		hint: "Eletromagnetismo"
	},
	{
		name: "Lincoln",
		era: "moderno",
		hint: "Presidente da abolição nos EUA"
	},
	{
		name: "Hawking",
		era: "contemporaneo",
		hint: "Buracos negros e cosmologia"
	},
	{
		name: "Beethoven",
		era: "moderno",
		hint: "Sinfonias do classicismo ao romantismo"
	},
	{
		name: "Hipátia",
		era: "antigo",
		hint: "Matemática de Alexandria"
	},
	{
		name: "Pitágoras",
		era: "antigo",
		hint: "Teorema dos triângulos"
	},
	{
		name: "Arquimedes",
		era: "antigo",
		hint: "Princípio do empuxo"
	},
	{
		name: "Euclides",
		era: "antigo",
		hint: "Elementos da geometria"
	},
	{
		name: "Aristóteles",
		era: "antigo",
		hint: "Filósofo da lógica e da natureza"
	},
	{
		name: "Alexandre",
		era: "antigo",
		hint: "Conquistador da Macedônia"
	},
	{
		name: "Hatshepsut",
		era: "antigo",
		hint: "Faraó mulher do Egito"
	},
	{
		name: "Tutancâmon",
		era: "antigo",
		hint: "Faraó da tumba intacta"
	},
	{
		name: "Copérnico",
		era: "moderno",
		hint: "Heliocentrismo"
	},
	{
		name: "Shakespeare",
		era: "moderno",
		hint: "Hamlet, Romeu e Julieta"
	},
	{
		name: "Cervantes",
		era: "moderno",
		hint: "Dom Quixote"
	},
	{
		name: "Vivaldi",
		era: "moderno",
		hint: "As Quatro Estações"
	},
	{
		name: "Chopin",
		era: "moderno",
		hint: "Noturnos para piano"
	},
	{
		name: "Debussy",
		era: "moderno",
		hint: "Impressionismo musical"
	},
	{
		name: "Tolstói",
		era: "moderno",
		hint: "Guerra e Paz"
	},
	{
		name: "Hemingway",
		era: "contemporaneo",
		hint: "O Velho e o Mar"
	},
	{
		name: "Tiradentes",
		era: "moderno",
		hint: "Inconfidência Mineira"
	},
	{
		name: "Gutenberg",
		era: "medieval",
		hint: "Prensa de tipos móveis"
	},
	{
		name: "Avicena",
		era: "medieval",
		hint: "Cânone da medicina"
	},
	{
		name: "Saladin",
		era: "medieval",
		hint: "Sultão das Cruzadas"
	},
	{
		name: "Joana dArc",
		era: "medieval",
		hint: "Donzela de Orléans"
	},
	{
		name: "Magalhães",
		era: "moderno",
		hint: "Primeira circum-navegação"
	},
	{
		name: "Cabral",
		era: "moderno",
		hint: "Chegada portuguesa ao Brasil"
	},
	{
		name: "Colombo",
		era: "moderno",
		hint: "Travessia do Atlântico em 1492"
	},
	{
		name: "Rembrandt",
		era: "moderno",
		hint: "Mestre do claro-escuro"
	},
	{
		name: "Velázquez",
		era: "moderno",
		hint: "Las Meninas"
	},
	{
		name: "Caravaggio",
		era: "moderno",
		hint: "Pintura barroca dramática"
	},
	{
		name: "Donatello",
		era: "medieval",
		hint: "Escultor do Renascimento"
	},
	{
		name: "Botticelli",
		era: "medieval",
		hint: "O Nascimento de Vênus"
	},
	{
		name: "Raffaello",
		era: "moderno",
		hint: "Escola de Atenas"
	},
	{
		name: "Tchaikovsky",
		era: "moderno",
		hint: "O Lago dos Cisnes"
	},
	{
		name: "Stravinsky",
		era: "contemporaneo",
		hint: "A Sagração da Primavera"
	},
	{
		name: "Niemeyer",
		era: "contemporaneo",
		hint: "Arquiteto de Brasília"
	},
	{
		name: "Drummond",
		era: "contemporaneo",
		hint: "Poeta de Itabira"
	},
	{
		name: "Villa-Lobos",
		era: "contemporaneo",
		hint: "Bachianas brasileiras"
	},
	{
		name: "Marie Curie",
		era: "moderno",
		hint: "Rádio, polônio e dois Nobéis"
	},
	{
		name: "Ada Lovelace",
		era: "moderno",
		hint: "Primeiro algoritmo de máquina"
	},
	{
		name: "Santos Dumont",
		era: "moderno",
		hint: "Pioneiro da aviação"
	},
	{
		name: "Frida Kahlo",
		era: "contemporaneo",
		hint: "Autorretratos mexicanos"
	},
	{
		name: "Ayrton Senna",
		era: "contemporaneo",
		hint: "Tricampeão mundial de F1"
	},
	{
		name: "Nelson Mandela",
		era: "contemporaneo",
		hint: "Nobel da Paz e liberdade"
	},
	{
		name: "Isaac Newton",
		era: "moderno",
		hint: "Principia Mathematica"
	},
	{
		name: "Alan Turing",
		era: "contemporaneo",
		hint: "Máquina de Turing e Enigma"
	},
	{
		name: "Van Gogh",
		era: "moderno",
		hint: "Noite Estrelada"
	},
	{
		name: "Picasso",
		era: "contemporaneo",
		hint: "Cubismo e Guernica"
	},
	{
		name: "Machado de Assis",
		era: "moderno",
		hint: "Dom Casmurro e o Bruxo do Cosme Velho"
	},
	{
		name: "Leonardo da Vinci",
		era: "moderno",
		hint: "Mona Lisa, inventor e anatomista"
	},
	{
		name: "Michelangelo",
		era: "moderno",
		hint: "Teto da Capela Sistina"
	},
	{
		name: "Clarice Lispector",
		era: "contemporaneo",
		hint: "A Hora da Estrela"
	},
	{
		name: "Florence Nightingale",
		era: "moderno",
		hint: "Fundadora da enfermagem moderna"
	},
	{
		name: "Amelia Earhart",
		era: "contemporaneo",
		hint: "Pioneira da aviação"
	},
	{
		name: "Neil Armstrong",
		era: "contemporaneo",
		hint: "Primeiro homem na Lua"
	},
	{
		name: "Princesa Isabel",
		era: "moderno",
		hint: "Lei Áurea no Brasil"
	},
	{
		name: "Anita Garibaldi",
		era: "moderno",
		hint: "Heroína da Farroupilha"
	},
	{
		name: "Maria Quitéria",
		era: "moderno",
		hint: "Soldado da independência"
	},
	{
		name: "Chico Mendes",
		era: "contemporaneo",
		hint: "Defensor da Amazônia"
	},
	{
		name: "Oscar Niemeyer",
		era: "contemporaneo",
		hint: "Curvas de concreto de Brasília"
	},
	{
		name: "Castro Alves",
		era: "moderno",
		hint: "Poeta dos escravos"
	},
	{
		name: "José de Alencar",
		era: "moderno",
		hint: "Iracema e o indianismo"
	},
	{
		name: "Sun Tzu",
		era: "antigo",
		hint: "A Arte da Guerra"
	},
	{
		name: "Heródoto",
		era: "antigo",
		hint: "Pai da história"
	},
	{
		name: "Tucídides",
		era: "antigo",
		hint: "Guerra do Peloponeso"
	},
	{
		name: "Marco Polo",
		era: "medieval",
		hint: "Viagens à Ásia"
	},
	{
		name: "Ibn Battuta",
		era: "medieval",
		hint: "Viajante do mundo islâmico"
	},
	{
		name: "Mansa Musa",
		era: "medieval",
		hint: "Imperador de Mali"
	},
	{
		name: "Gengis Khan",
		era: "medieval",
		hint: "Império Mongol"
	},
	{
		name: "Isabel I",
		era: "moderno",
		hint: "Rainha da era elisabetana"
	},
	{
		name: "Pedro II",
		era: "moderno",
		hint: "Último imperador do Brasil"
	},
	{
		name: "Dandara",
		era: "moderno",
		hint: "Guerreira de Palmares"
	},
	{
		name: "Tarsila",
		era: "contemporaneo",
		hint: "Abaporu e o modernismo"
	},
	{
		name: "Portinari",
		era: "contemporaneo",
		hint: "Guerra e Paz no ONU"
	},
	{
		name: "Cora Coralina",
		era: "contemporaneo",
		hint: "Poetisa de Goiás"
	},
	{
		name: "Cecília Meireles",
		era: "contemporaneo",
		hint: "Romanceiro da Inconfidência"
	},
	{
		name: "Santos",
		era: "moderno",
		hint: "Alberto Santos Dumont"
	}
];
function waveConfig(wave) {
	const w = Math.max(1, wave);
	return {
		maxShips: Math.min(2 + Math.floor((w - 1) / 2), 5),
		speed: 42 + w * 8,
		spawnInterval: Math.max(.65, 2.35 - w * .14),
		minLen: w < 3 ? 3 : w < 6 ? 4 : 5,
		maxLen: w < 2 ? 6 : w < 4 ? 8 : w < 7 ? 12 : 22,
		allowSpaces: w >= 4,
		quota: 6 + w * 2
	};
}
function normalizeChar(ch) {
	return ch.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
function charsMatch(input, expected) {
	return normalizeChar(input) === normalizeChar(expected);
}
function firstLetter(name) {
	return normalizeChar(name[0] ?? "");
}
function pickFigure(wave, used, blockedFirst) {
	const cfg = waveConfig(wave);
	const fits = (f, relaxFirst, relaxUsed, relaxLen) => {
		const L = f.name.length;
		if (!relaxLen && (L < cfg.minLen || L > cfg.maxLen)) return false;
		if (!cfg.allowSpaces && f.name.includes(" ")) return false;
		if (!relaxUsed && used.has(f.name)) return false;
		if (!relaxFirst && blockedFirst.has(firstLetter(f.name))) return false;
		return true;
	};
	const tryPool = (relaxFirst, relaxUsed, relaxLen) => FIGURES.filter((f) => fits(f, relaxFirst, relaxUsed, relaxLen));
	let pool = tryPool(false, false, false);
	if (pool.length === 0) pool = tryPool(false, true, false);
	if (pool.length === 0) pool = tryPool(true, true, false);
	if (pool.length === 0) pool = tryPool(true, true, true);
	if (pool.length === 0) return null;
	return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
function readPalette() {
	const s = getComputedStyle(document.documentElement);
	const v = (name, fb) => s.getPropertyValue(name).trim() || fb;
	return {
		bg: v("--color-bg", "#08090c"),
		surface: v("--color-surface", "#13151c"),
		fg: v("--color-fg", "#f0efe8"),
		muted: v("--color-muted", "#8e9188"),
		accent: v("--color-accent", "#c5cdd6"),
		danger: v("--color-danger", "#c45c4a"),
		parchment: v("--color-parchment", "#d7c4a3")
	};
}
function noise(t) {
	return Math.sin(t * 17.13) * .45 + Math.sin(t * 9.2) * .35 + Math.sin(t * 3.7) * .2;
}
function drawWorld(ctx, world, sprites, pal) {
	const { w, h } = world;
	ctx.save();
	const shakeAmt = world.shakeOn && !world.reduceMotion ? world.trauma * world.trauma : 0;
	if (shakeAmt > .01) {
		ctx.translate(noise(world.t * 40) * 14 * shakeAmt, noise(world.t * 33 + 2) * 10 * shakeAmt);
		ctx.rotate(noise(world.t * 21 + 1) * .018 * shakeAmt);
	}
	ctx.fillStyle = pal.bg;
	ctx.fillRect(-40, -40, w + 80, h + 80);
	if (sprites.bg) {
		const img = sprites.bg;
		const scale = Math.max(w / img.width, h / img.height);
		const dw = img.width * scale;
		const dh = img.height * scale;
		ctx.globalAlpha = .72;
		ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
		ctx.globalAlpha = 1;
	}
	drawStars(ctx, world, pal);
	drawDanger(ctx, world, pal);
	for (const p of world.particles) if (p.kind === "smoke") drawSmoke(ctx, p);
	else drawSpark(ctx, p);
	for (const laser of world.lasers) drawLaser(ctx, laser, pal);
	for (const ship of world.ships) drawShip(ctx, ship, sprites, pal, ship.id === world.lockedId, world.t, h, w);
	drawPlayer(ctx, world, sprites, pal);
	for (const f of world.floaters) drawFloater(ctx, f, pal);
	const g = ctx.createRadialGradient(w / 2, h * .4, h * .15, w / 2, h * .5, h * .85);
	g.addColorStop(0, "rgba(8,9,12,0)");
	g.addColorStop(1, "rgba(8,9,12,0.55)");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
}
function drawStars(ctx, world, pal) {
	const { w, h, t } = world;
	ctx.save();
	ctx.fillStyle = pal.fg;
	for (let i = 0; i < 70; i++) {
		const seed = i * 97.13;
		const x = seed * 13 % 1 * w;
		const layer = .25 + i % 3 * .2;
		const y = (seed * 7 % 1 * h + t * 8 * layer) % h;
		const a = .15 + i % 5 * .08;
		ctx.globalAlpha = a;
		const s = i % 9 === 0 ? 1.6 : .8;
		ctx.fillRect(x, y, s, s);
		if (i % 11 === 0) {
			ctx.globalAlpha = a * .5;
			ctx.fillRect(x - 2, y + .4, 5, .6);
			ctx.fillRect(x + .4, y - 2, .6, 5);
		}
	}
	ctx.restore();
}
function drawDanger(ctx, world, pal) {
	const { w, h } = world;
	const zone = h * .18;
	const g = ctx.createLinearGradient(0, h - zone, 0, h);
	g.addColorStop(0, "rgba(196,92,74,0)");
	g.addColorStop(1, "rgba(196,92,74,0.16)");
	ctx.fillStyle = g;
	ctx.fillRect(0, h - zone, w, zone);
	ctx.strokeStyle = pal.danger;
	ctx.globalAlpha = .25;
	ctx.setLineDash([4, 8]);
	ctx.beginPath();
	ctx.moveTo(16, h - zone);
	ctx.lineTo(w - 16, h - zone);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.globalAlpha = 1;
}
function shipSize(ship) {
	const base = ship.figure.name.length > 10 ? 58 : 52;
	if (ship.hull === 1) return {
		w: base * 1.15,
		h: base * .78
	};
	if (ship.hull === 2) return {
		w: base * .85,
		h: base * 1.05
	};
	return {
		w: base,
		h: base * .82
	};
}
function drawShip(ctx, ship, sprites, pal, locked, t, viewH, viewW) {
	const { w, h } = shipSize(ship);
	const bob = Math.sin(t * 2.2 + ship.bob) * 2.5;
	const y = ship.y + bob;
	const img = sprites.aliens[ship.hull];
	const threat = Math.min(1, Math.max(0, (y - viewH * .55) / (viewH * .35)));
	ctx.save();
	ctx.translate(ship.x, y);
	if (locked) {
		ctx.shadowColor = pal.parchment;
		ctx.shadowBlur = 18;
		ctx.beginPath();
		ctx.ellipse(0, 4, w * .7, h * .55, 0, 0, Math.PI * 2);
		ctx.strokeStyle = pal.parchment;
		ctx.globalAlpha = .55;
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.shadowBlur = 0;
	}
	if (img) {
		ctx.save();
		ctx.rotate(Math.PI);
		ctx.drawImage(img, -w / 2, -h / 2, w, h);
		ctx.restore();
	} else drawFallbackAlien(ctx, ship.hull, w, h, pal, threat);
	if (threat > .35) {
		ctx.globalAlpha = (threat - .35) * .5;
		ctx.fillStyle = pal.danger;
		ctx.beginPath();
		ctx.ellipse(0, 0, w * .4, h * .3, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	ctx.restore();
	drawNameplate(ctx, ship, pal, locked, y + h * .48, viewH, viewW);
}
function drawFallbackAlien(ctx, hull, w, h, pal, threat) {
	ctx.fillStyle = pal.surface;
	ctx.strokeStyle = threat > .5 ? pal.danger : pal.accent;
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	if (hull === 1) ctx.ellipse(0, 0, w * .48, h * .32, 0, 0, Math.PI * 2);
	else if (hull === 2) {
		ctx.moveTo(0, h * .45);
		ctx.lineTo(w * .4, -h * .35);
		ctx.lineTo(0, -h * .15);
		ctx.lineTo(-w * .4, -h * .35);
		ctx.closePath();
	} else {
		ctx.moveTo(0, -h * .4);
		ctx.lineTo(w * .45, h * .15);
		ctx.lineTo(w * .2, h * .4);
		ctx.lineTo(-w * .2, h * .4);
		ctx.lineTo(-w * .45, h * .15);
		ctx.closePath();
	}
	ctx.fill();
	ctx.stroke();
}
function drawNameplate(ctx, ship, pal, locked, y, viewH, viewW) {
	const name = ship.figure.name;
	const typed = ship.typed;
	ctx.font = `500 ${locked ? 16 : 14}px "IBM Plex Sans", system-ui, sans-serif`;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	const gap = 1.2;
	let total = 0;
	const widths = [];
	for (const ch of name) {
		const glyph = ch === " " ? "·" : ch;
		const ww = ctx.measureText(glyph).width + gap;
		widths.push(ww);
		total += ww;
	}
	const padX = 10;
	const boxW = total + 20;
	const boxH = 26;
	let boxY = y + 6;
	if (boxY + boxH > viewH - 88) boxY = y - 40;
	const boxX = Math.max(8, Math.min(ship.x - boxW / 2, viewW - boxW - 8));
	ctx.save();
	roundRect(ctx, boxX, boxY, boxW, boxH, 8);
	ctx.fillStyle = locked ? "rgba(19,21,28,0.92)" : "rgba(8,9,12,0.78)";
	ctx.fill();
	ctx.strokeStyle = locked ? pal.parchment : pal.accent;
	ctx.globalAlpha = locked ? .7 : .25;
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.globalAlpha = 1;
	let cx = boxX + padX;
	for (let i = 0; i < name.length; i++) {
		const ch = name[i] === " " ? "·" : name[i];
		const done = i < typed;
		const next = i === typed;
		if (done) {
			ctx.fillStyle = pal.muted;
			ctx.globalAlpha = .45;
		} else if (next) {
			ctx.fillStyle = locked ? pal.parchment : pal.fg;
			ctx.globalAlpha = 1;
		} else {
			ctx.fillStyle = pal.fg;
			ctx.globalAlpha = locked ? .92 : .78;
		}
		ctx.fillText(ch, cx, boxY + boxH / 2 + .5);
		if (next) {
			ctx.globalAlpha = .9;
			ctx.fillStyle = locked ? pal.parchment : pal.accent;
			ctx.fillRect(cx, boxY + boxH - 5, Math.max(6, widths[i] - gap), 1.5);
		}
		cx += widths[i];
	}
	ctx.restore();
}
function drawPlayer(ctx, world, sprites, pal) {
	const { playerX: x, playerY: y, t } = world;
	const flicker = .65 + Math.sin(t * 18) * .2;
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = pal.parchment;
	ctx.globalAlpha = .35 * flicker;
	ctx.beginPath();
	ctx.moveTo(-5, 10);
	ctx.lineTo(0, 28 + flicker * 10);
	ctx.lineTo(5, 10);
	ctx.fill();
	ctx.globalAlpha = 1;
	const img = sprites.player;
	const pw = 46;
	const ph = 92;
	if (img) ctx.drawImage(img, -23, -46, pw, ph);
	else {
		ctx.fillStyle = pal.fg;
		ctx.strokeStyle = pal.accent;
		ctx.beginPath();
		ctx.moveTo(0, -36);
		ctx.lineTo(16, 22);
		ctx.lineTo(0, 10);
		ctx.lineTo(-16, 22);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
}
function drawLaser(ctx, laser, pal) {
	const a = laser.life / laser.maxLife;
	ctx.save();
	ctx.strokeStyle = pal.fg;
	ctx.globalAlpha = a;
	ctx.lineWidth = 2.4;
	ctx.beginPath();
	ctx.moveTo(laser.x0, laser.y0);
	ctx.lineTo(laser.x1, laser.y1);
	ctx.stroke();
	ctx.strokeStyle = pal.parchment;
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
}
function drawSpark(ctx, p) {
	const a = p.life / p.maxLife;
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = p.color;
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.size * (.4 + a), 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawSmoke(ctx, p) {
	const a = p.life / p.maxLife * .35;
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = p.color;
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.size * (1.4 - p.life / p.maxLife), 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawFloater(ctx, f, pal) {
	const k = f.life / f.maxLife;
	ctx.save();
	ctx.globalAlpha = k;
	ctx.fillStyle = pal.parchment;
	ctx.font = "600 13px \"IBM Plex Sans\", system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(f.text, f.x, f.y - (1 - k) * 18);
	ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
var KEY = "nomenavis-save-v1";
var VERSION = 1;
var MAX_SCORES = 10;
var defaults = {
	version: VERSION,
	scores: [],
	muted: false,
	shake: true
};
function migrate(raw) {
	const s = {
		...defaults,
		...raw,
		version: VERSION
	};
	s.scores = Array.isArray(raw.scores) ? raw.scores.filter((x) => x && typeof x.score === "number").slice(0, MAX_SCORES) : [];
	s.muted = Boolean(raw.muted);
	s.shake = raw.shake !== false;
	return s;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return {
			...defaults,
			scores: []
		};
		return migrate(JSON.parse(raw));
	} catch {
		return {
			...defaults,
			scores: []
		};
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...data,
			version: VERSION
		}));
	} catch {}
}
function highScoreOf(scores) {
	return scores[0]?.score ?? 0;
}
function recordScore(save, entry) {
	const scores = [...save.scores, entry].sort((a, b) => b.score - a.score || b.at - a.at).slice(0, MAX_SCORES);
	const isNew = scores[0]?.at === entry.at && entry.score > 0;
	const next = {
		...save,
		scores
	};
	writeSave(next);
	return {
		save: next,
		isNew
	};
}
function patchSettings(save, patch) {
	const next = {
		...save,
		...patch
	};
	writeSave(next);
	return next;
}
var STEP = 1 / 60;
var LIVES = 3;
var Engine = class {
	canvas;
	ctx;
	onUi;
	raf = 0;
	last = 0;
	acc = 0;
	t = 0;
	w = 390;
	h = 700;
	dpr = 1;
	phase = "title";
	prevPhase = "title";
	score = 0;
	combo = 0;
	maxCombo = 0;
	lives = LIVES;
	wave = 1;
	quota = 8;
	spawnTimer = .4;
	ships = [];
	lasers = [];
	particles = [];
	floaters = [];
	lockedId = null;
	nextId = 1;
	used = /* @__PURE__ */ new Set();
	shipsDestroyed = 0;
	letters = 0;
	misses = 0;
	trauma = 0;
	hitstop = 0;
	playerX = 0;
	playerY = 0;
	lastHint = "";
	lastName = "";
	hintAge = 99;
	waveBanner = "";
	waveBannerAge = 99;
	isNewRecord = false;
	save;
	audio = new GameAudio();
	sprites = {
		player: null,
		aliens: [
			null,
			null,
			null
		],
		bg: null
	};
	pal = null;
	reduceMotion = false;
	running = false;
	kbOffset = 0;
	ro = null;
	uiPulse = 0;
	constructor(canvas, onUi) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) throw new Error("Canvas 2D indisponível");
		this.ctx = ctx;
		this.onUi = onUi;
		this.save = loadSave();
		this.audio.setMuted(this.save.muted);
		this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.resize();
		this.ro = new ResizeObserver(() => this.resize());
		this.ro.observe(canvas.parentElement ?? canvas);
		this.seedAttract();
		this.emit();
	}
	async boot() {
		this.sprites = await loadSprites();
		this.pal = readPalette();
		this.emit();
	}
	startLoop() {
		if (this.running) return;
		this.running = true;
		this.last = performance.now();
		const tick = (now) => {
			if (!this.running) return;
			let dt = Math.min((now - this.last) / 1e3, .1);
			this.last = now;
			if (this.hitstop > 0) {
				this.hitstop -= dt;
				dt *= .12;
			}
			this.acc += dt;
			while (this.acc >= STEP) {
				this.sim(STEP);
				this.acc -= STEP;
			}
			this.draw();
			this.raf = requestAnimationFrame(tick);
		};
		this.raf = requestAnimationFrame(tick);
	}
	destroy() {
		this.running = false;
		cancelAnimationFrame(this.raf);
		this.ro?.disconnect();
		this.audio.stopDrone();
	}
	unlockAudio() {
		this.audio.unlock();
		this.audio.startDrone();
	}
	setKbOffset(px) {
		this.kbOffset = Math.max(0, px);
	}
	snapshot() {
		const locked = this.ships.find((s) => s.id === this.lockedId);
		return {
			phase: this.phase,
			score: this.score,
			highScore: highScoreOf(this.save.scores),
			combo: this.combo,
			maxCombo: this.maxCombo,
			lives: this.lives,
			wave: this.wave,
			lockedName: locked?.figure.name ?? "",
			typed: locked?.typed ?? 0,
			lastHint: this.lastHint,
			lastName: this.lastName,
			hintAge: this.hintAge,
			isNewRecord: this.isNewRecord,
			shipsDestroyed: this.shipsDestroyed,
			letters: this.letters,
			misses: this.misses,
			muted: this.save.muted,
			shake: this.save.shake,
			scores: this.save.scores,
			waveBanner: this.waveBanner,
			waveBannerAge: this.waveBannerAge,
			kbOffset: this.kbOffset
		};
	}
	play() {
		this.unlockAudio();
		this.resetRun();
		this.phase = "playing";
		this.waveBanner = "Onda 1";
		this.waveBannerAge = 0;
		this.audio.wave();
		this.emit();
	}
	pause() {
		if (this.phase !== "playing") return;
		this.phase = "paused";
		this.emit();
	}
	resume() {
		if (this.phase !== "paused") return;
		this.phase = "playing";
		this.emit();
	}
	toTitle() {
		this.phase = "title";
		this.ships = [];
		this.lasers = [];
		this.particles = [];
		this.floaters = [];
		this.lockedId = null;
		this.used = /* @__PURE__ */ new Set();
		this.seedAttract();
		this.emit();
	}
	openHow(from = this.phase) {
		this.prevPhase = from === "howto" ? "title" : from;
		this.phase = "howto";
		this.emit();
	}
	openScores() {
		this.prevPhase = this.phase === "scores" ? "title" : this.phase;
		this.phase = "scores";
		this.emit();
	}
	closeOverlay() {
		if (this.phase === "howto" || this.phase === "scores") {
			this.phase = this.prevPhase === "playing" ? "paused" : this.prevPhase;
			if (this.phase === "howto" || this.phase === "scores") this.phase = "title";
			this.emit();
		}
	}
	toggleMute() {
		this.save = patchSettings(this.save, { muted: !this.save.muted });
		this.audio.setMuted(this.save.muted);
		this.emit();
	}
	toggleShake() {
		this.save = patchSettings(this.save, { shake: !this.save.shake });
		this.emit();
	}
	typeChar(raw) {
		if (this.phase !== "playing") return;
		if (raw.length !== 1) return;
		if (!/[\p{L} \-']/u.test(raw)) return;
		if (this.lockedId != null) {
			const ship = this.ships.find((s) => s.id === this.lockedId);
			if (!ship) {
				this.lockedId = null;
				this.typeChar(raw);
				return;
			}
			const expected = ship.figure.name[ship.typed];
			if (expected && charsMatch(raw, expected)) this.accept(ship);
			else this.miss();
			return;
		}
		const candidates = this.ships.filter((s) => s.typed === 0 && charsMatch(raw, s.figure.name[0] ?? ""));
		if (!candidates.length) {
			this.miss();
			return;
		}
		candidates.sort((a, b) => b.y - a.y);
		const target = candidates[0];
		this.lockedId = target.id;
		this.audio.lock();
		this.accept(target);
	}
	typeString(s) {
		for (const ch of s) this.typeChar(ch);
	}
	resetRun() {
		this.score = 0;
		this.combo = 0;
		this.maxCombo = 0;
		this.lives = LIVES;
		this.wave = 1;
		this.quota = waveConfig(1).quota;
		this.spawnTimer = .35;
		this.ships = [];
		this.lasers = [];
		this.particles = [];
		this.floaters = [];
		this.lockedId = null;
		this.used = /* @__PURE__ */ new Set();
		this.shipsDestroyed = 0;
		this.letters = 0;
		this.misses = 0;
		this.trauma = 0;
		this.hitstop = 0;
		this.lastHint = "";
		this.lastName = "";
		this.hintAge = 99;
		this.isNewRecord = false;
		this.playerX = this.w / 2;
		this.playerY = this.h - 78;
	}
	seedAttract() {
		this.ships = [];
		this.playerX = this.w / 2;
		this.playerY = this.h - 78;
		for (let i = 0; i < 3; i++) {
			const fig = pickFigure(3 + i, this.used, new Set(this.ships.map((s) => firstLetter(s.figure.name))));
			if (!fig) continue;
			this.used.add(fig.name);
			this.ships.push(this.makeShip(fig, 80 + i * ((this.w - 160) / 2), 90 + i * 70, true));
		}
	}
	makeShip(figure, x, y, attract = false) {
		const hull = Math.floor(Math.random() * 3);
		return {
			id: this.nextId++,
			figure,
			typed: 0,
			x,
			y,
			vx: attract ? Math.random() * 18 - 9 : 0,
			wobble: Math.random() * Math.PI * 2,
			hull,
			bob: Math.random() * Math.PI * 2
		};
	}
	sim(dt) {
		this.t += dt;
		this.hintAge += dt;
		this.waveBannerAge += dt;
		this.trauma = Math.max(0, this.trauma - dt * 1.85);
		if (this.phase === "title" || this.phase === "howto" || this.phase === "scores") {
			this.simAttract(dt);
			this.stepFx(dt);
			return;
		}
		if (this.phase !== "playing") {
			this.stepFx(dt);
			return;
		}
		const cfg = waveConfig(this.wave);
		this.playerY = this.h - 78 - Math.min(this.kbOffset * .15, 24);
		const locked = this.ships.find((s) => s.id === this.lockedId);
		const targetX = locked ? locked.x : this.w / 2;
		this.playerX += (targetX - this.playerX) * (1 - Math.exp(-5.5 * dt));
		this.uiPulse += dt;
		if (this.uiPulse > .12) {
			this.uiPulse = 0;
			this.emit();
		}
		this.spawnTimer -= dt;
		if (this.ships.length < cfg.maxShips && this.quota > this.ships.length && this.spawnTimer <= 0) {
			this.spawn();
			this.spawnTimer = cfg.spawnInterval;
		}
		const speed = cfg.speed * (this.h / 720);
		for (const ship of this.ships) {
			ship.wobble += dt;
			ship.x += Math.sin(ship.wobble * 1.3) * 18 * dt;
			ship.x = Math.max(48, Math.min(this.w - 48, ship.x));
			ship.y += speed * dt;
			if (ship.y > this.playerY - 36) this.crash(ship);
		}
		this.stepFx(dt);
		if (this.quota <= 0 && this.ships.length === 0 && this.lives > 0) this.nextWave();
	}
	simAttract(dt) {
		this.playerX += (this.w / 2 - this.playerX) * (1 - Math.exp(-3 * dt));
		this.playerY = this.h - 78;
		for (const ship of this.ships) {
			ship.wobble += dt;
			ship.x += Math.sin(ship.wobble) * 12 * dt;
			ship.y += 10 * dt;
			if (ship.y > this.h * .55) ship.y = 70;
			ship.x = Math.max(48, Math.min(this.w - 48, ship.x));
		}
	}
	stepFx(dt) {
		for (const l of this.lasers) l.life -= dt;
		this.lasers = this.lasers.filter((l) => l.life > 0);
		for (const p of this.particles) {
			p.life -= dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vy += 40 * dt;
		}
		if (this.particles.length > 220) this.particles.splice(0, this.particles.length - 220);
		this.particles = this.particles.filter((p) => p.life > 0);
		for (const f of this.floaters) {
			f.life -= dt;
			f.y -= 22 * dt;
		}
		this.floaters = this.floaters.filter((f) => f.life > 0);
	}
	spawn() {
		const blocked = new Set(this.ships.map((s) => firstLetter(s.figure.name)));
		const fig = pickFigure(this.wave, this.used, blocked);
		if (!fig) return;
		this.used.add(fig.name);
		let x = 56 + Math.random() * (this.w - 112);
		for (let i = 0; i < 8; i++) {
			if (!this.ships.some((s) => Math.abs(s.x - x) < 70 && s.y < 140)) break;
			x = 56 + Math.random() * (this.w - 112);
		}
		this.ships.push(this.makeShip(fig, x, -40));
	}
	accept(ship) {
		ship.typed += 1;
		this.letters += 1;
		this.combo += 1;
		this.maxCombo = Math.max(this.maxCombo, this.combo);
		const gained = 10 + Math.min(this.combo, 20);
		this.score += gained;
		this.audio.type();
		this.audio.laser();
		this.fireLaser(ship);
		this.burst(ship.x, ship.y, 5, this.pal?.parchment ?? "#d7c4a3");
		this.trauma = Math.min(1, this.trauma + .08);
		if (ship.typed >= ship.figure.name.length) this.destroyShip(ship);
		this.emit();
	}
	destroyShip(ship) {
		const bonus = 40 + ship.figure.name.length * 12 + Math.min(this.combo, 12) * 8;
		this.score += bonus;
		this.shipsDestroyed += 1;
		this.quota = Math.max(0, this.quota - 1);
		this.lastName = ship.figure.name;
		this.lastHint = ship.figure.hint;
		this.hintAge = 0;
		this.floaters.push({
			text: `+${bonus}`,
			x: ship.x,
			y: ship.y - 10,
			life: .8,
			maxLife: .8
		});
		this.explode(ship.x, ship.y);
		this.audio.explode();
		this.trauma = Math.min(1, this.trauma + .42);
		this.hitstop = this.reduceMotion ? 0 : .045;
		if (this.lockedId === ship.id) this.lockedId = null;
		this.ships = this.ships.filter((s) => s.id !== ship.id);
	}
	crash(ship) {
		this.explode(ship.x, ship.y);
		this.audio.explode();
		this.trauma = Math.min(1, this.trauma + .7);
		this.hitstop = this.reduceMotion ? 0 : .08;
		if (this.lockedId === ship.id) this.lockedId = null;
		this.ships = this.ships.filter((s) => s.id !== ship.id);
		this.quota = Math.max(0, this.quota - 1);
		this.combo = 0;
		this.lives -= 1;
		if (this.lives <= 0) this.finish();
		this.emit();
	}
	miss() {
		this.misses += 1;
		this.combo = 0;
		this.audio.miss();
		this.trauma = Math.min(1, this.trauma + .12);
		this.emit();
	}
	nextWave() {
		this.wave += 1;
		const cfg = waveConfig(this.wave);
		this.quota = cfg.quota;
		this.spawnTimer = .55;
		this.score += 120 * this.wave;
		this.waveBanner = `Onda ${this.wave}`;
		this.waveBannerAge = 0;
		this.audio.wave();
		if (this.used.size > 70) this.used.clear();
		this.emit();
	}
	finish() {
		this.phase = "gameover";
		this.audio.gameOver();
		const entry = {
			score: this.score,
			wave: this.wave,
			ships: this.shipsDestroyed,
			at: Date.now()
		};
		const result = recordScore(this.save, entry);
		this.save = result.save;
		this.isNewRecord = result.isNew;
		this.emit();
	}
	fireLaser(ship) {
		this.lasers.push({
			x0: this.playerX,
			y0: this.playerY - 40,
			x1: ship.x,
			y1: ship.y + 8,
			life: .1,
			maxLife: .1
		});
	}
	burst(x, y, n, color) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const sp = 40 + Math.random() * 90;
			this.particles.push({
				x,
				y,
				vx: Math.cos(a) * sp,
				vy: Math.sin(a) * sp,
				life: .25 + Math.random() * .25,
				maxLife: .5,
				size: 1.4 + Math.random() * 1.6,
				color,
				kind: "spark"
			});
		}
	}
	explode(x, y) {
		const pal = this.pal;
		this.burst(x, y, 18, pal?.fg ?? "#f0efe8");
		this.burst(x, y, 10, pal?.parchment ?? "#d7c4a3");
		for (let i = 0; i < 8; i++) this.particles.push({
			x,
			y,
			vx: (Math.random() - .5) * 40,
			vy: -20 - Math.random() * 30,
			life: .5 + Math.random() * .3,
			maxLife: .8,
			size: 6 + Math.random() * 8,
			color: pal?.muted ?? "#8e9188",
			kind: "smoke"
		});
	}
	resize() {
		const rect = (this.canvas.parentElement ?? this.canvas).getBoundingClientRect();
		this.w = Math.max(320, rect.width);
		this.h = Math.max(480, rect.height);
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);
		this.canvas.width = Math.floor(this.w * this.dpr);
		this.canvas.height = Math.floor(this.h * this.dpr);
		this.canvas.style.width = `${this.w}px`;
		this.canvas.style.height = `${this.h}px`;
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.playerY = this.h - 78;
		if (this.phase !== "playing") this.playerX = this.w / 2;
	}
	draw() {
		if (!this.pal) this.pal = readPalette();
		drawWorld(this.ctx, {
			w: this.w,
			h: this.h,
			t: this.t,
			ships: this.ships,
			lasers: this.lasers,
			particles: this.particles,
			floaters: this.floaters,
			playerX: this.playerX,
			playerY: this.playerY,
			lockedId: this.lockedId,
			trauma: this.trauma,
			reduceMotion: this.reduceMotion,
			shakeOn: this.save.shake,
			phase: this.phase
		}, this.sprites, this.pal);
	}
	emit() {
		this.onUi(this.snapshot());
	}
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var INITIAL = {
	phase: "title",
	score: 0,
	highScore: 0,
	combo: 0,
	maxCombo: 0,
	lives: 3,
	wave: 1,
	lockedName: "",
	typed: 0,
	lastHint: "",
	lastName: "",
	hintAge: 99,
	isNewRecord: false,
	shipsDestroyed: 0,
	letters: 0,
	misses: 0,
	muted: false,
	shake: true,
	scores: [],
	waveBanner: "",
	waveBannerAge: 99,
	kbOffset: 0
};
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [ui, setUi] = (0, import_react.useState)(INITIAL);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new Engine(canvas, setUi);
		engineRef.current = engine;
		engine.boot();
		engine.startLoop();
		const onKey = (e) => {
			const phase = engine.snapshot().phase;
			if (e.key === "Escape") {
				if (phase === "playing") engine.pause();
				else if (phase === "paused") engine.resume();
				else if (phase === "howto" || phase === "scores") engine.closeOverlay();
				return;
			}
			if (e.repeat || phase !== "playing") return;
			const el = e.target;
			if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
			if (e.key.length === 1) {
				e.preventDefault();
				engine.typeChar(e.key);
			}
		};
		window.addEventListener("keydown", onKey);
		const onVis = () => {
			engine.unlockAudio();
			if (document.hidden && engine.snapshot().phase === "playing") engine.pause();
		};
		document.addEventListener("visibilitychange", onVis);
		const vv = window.visualViewport;
		const onVv = () => {
			if (!vv) return;
			const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
			engine.setKbOffset(offset);
			setUi((u) => ({
				...u,
				kbOffset: offset
			}));
		};
		vv?.addEventListener("resize", onVv);
		vv?.addEventListener("scroll", onVv);
		window.__nomenavis = {
			type: (s) => engine.typeString(s),
			play: () => engine.play(),
			snapshot: () => engine.snapshot()
		};
		return () => {
			window.removeEventListener("keydown", onKey);
			document.removeEventListener("visibilitychange", onVis);
			vv?.removeEventListener("resize", onVv);
			vv?.removeEventListener("scroll", onVv);
			engine.destroy();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (ui.phase === "playing") inputRef.current?.focus();
	}, [ui.phase]);
	const e = () => engineRef.current;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				"aria-hidden": true
			}),
			ui.phase === "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {
				ui,
				onPause: () => e()?.pause()
			}),
			ui.phase === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
				ui,
				onPlay: () => e()?.play(),
				onHow: () => e()?.openHow("title"),
				onScores: () => e()?.openScores(),
				onMute: () => e()?.toggleMute()
			}),
			ui.phase === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseMenu, {
				ui,
				onResume: () => e()?.resume(),
				onHow: () => e()?.openHow("paused"),
				onQuit: () => e()?.toTitle(),
				onMute: () => e()?.toggleMute(),
				onShake: () => e()?.toggleShake()
			}),
			ui.phase === "gameover" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOver, {
				ui,
				onRetry: () => e()?.play(),
				onMenu: () => e()?.toTitle()
			}),
			ui.phase === "howto" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowTo, { onClose: () => e()?.closeOverlay() }),
			ui.phase === "scores" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scores, {
				ui,
				onClose: () => e()?.closeOverlay()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				"aria-label": "Digite o nome da nave",
				autoCapitalize: "off",
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: false,
				inputMode: "text",
				enterKeyHint: "done",
				className: cn("absolute left-1/2 z-20 -translate-x-1/2 bg-surface/90 text-fg", "border border-border rounded-md px-3 text-base", "focus:outline-none focus:ring-2 focus:ring-accent/40", ui.phase === "playing" ? "md:sr-only" : "sr-only"),
				style: {
					bottom: ui.phase === "playing" ? `calc(12px + ${ui.kbOffset}px)` : 0,
					width: "min(92vw, 420px)",
					height: 44
				},
				onChange: (ev) => {
					const v = ev.target.value;
					e()?.typeString(v);
					ev.target.value = "";
				},
				onBlur: () => {
					if (engineRef.current?.snapshot().phase === "playing") inputRef.current?.focus();
				}
			})
		]
	});
}
function Hud({ ui, onPause }) {
	const acc = ui.letters + ui.misses === 0 ? 100 : Math.round(ui.letters / (ui.letters + ui.misses) * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-xs font-medium uppercase tracking-[0.18em] text-muted",
						children: "Pontos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-2xl font-medium tabular-nums leading-tight text-fg",
						children: ui.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-sans text-xs text-muted tabular-nums",
						children: ["Recorde ", ui.highScore]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onPause,
							className: "pointer-events-auto flex size-11 items-center justify-center rounded-md border border-border bg-surface/80 text-fg",
							"aria-label": "Pausar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
								className: "size-4",
								strokeWidth: 1.75
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1.5",
							"aria-label": `${ui.lives} vidas`,
							children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block h-1.5 w-5 rounded-full", i < ui.lives ? "bg-fg" : "bg-subtle") }, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-sans text-xs uppercase tracking-[0.16em] text-muted",
							children: ["Onda ", ui.wave]
						})
					]
				})]
			}),
			ui.combo >= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "absolute left-1/2 top-24 -translate-x-1/2 font-display text-xl text-parchment tabular-nums",
				children: ["Combo ", ui.combo]
			}),
			ui.waveBannerAge < 1.6 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute left-1/2 top-[38%] -translate-x-1/2 font-display text-3xl tracking-wide text-fg",
				children: ui.waveBanner
			}),
			ui.hintAge < 2.8 && ui.lastName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-[22%] w-[min(90vw,360px)] -translate-x-1/2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg text-fg",
					children: ui.lastName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-sm text-muted",
					children: ui.lastHint
				})]
			}),
			ui.lockedName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 w-[min(92vw,420px)] -translate-x-1/2 text-center",
				style: { bottom: `calc(64px + ${ui.kbOffset}px)` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-lg font-medium tracking-wide",
					children: ui.lockedName.split("").map((ch, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn(i < ui.typed && "text-muted", i === ui.typed && "text-parchment", i > ui.typed && "text-fg"),
						children: ch === " " ? "·" : ch
					}, `${ch}-${i}`))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-sans text-xs text-subtle",
					children: [
						"Precisão ",
						acc,
						"% · ",
						ui.shipsDestroyed,
						" naves"
					]
				})]
			})
		]
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/55 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]", className),
			children
		})
	});
}
function Btn({ children, onClick, variant = "primary" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98]", variant === "primary" && "bg-fg text-accent-fg", variant === "ghost" && "border border-border bg-transparent text-fg"),
		children
	});
}
function Title({ ui, onPlay, onHow, onScores, onMute }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-20 flex flex-col items-center justify-end px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onMute,
				className: "absolute right-4 top-[max(12px,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-md border border-border bg-surface/70 text-fg",
				"aria-label": ui.muted ? "Ativar som" : "Silenciar",
				children: ui.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-auto mt-[18vh] text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-xs font-medium uppercase tracking-[0.28em] text-muted",
						children: "nomen · navis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl font-medium tracking-[-0.03em] text-fg",
						children: "Nomenavis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-sans text-sm text-muted",
						children: "Digite o nome. Destrua a nave."
					}),
					ui.highScore > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 font-sans text-xs tabular-nums text-subtle",
						children: ["Recorde ", ui.highScore]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full max-w-sm flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: onPlay,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
							className: "size-4",
							strokeWidth: 1.75
						}), "Jogar"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						variant: "ghost",
						onClick: onScores,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
							className: "size-4",
							strokeWidth: 1.75
						}), "Recordes"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						variant: "ghost",
						onClick: onHow,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
							className: "size-4",
							strokeWidth: 1.75
						}), "Como jogar"]
					})
				]
			})
		]
	});
}
function PauseMenu({ ui, onResume, onHow, onQuit, onMute, onShake }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl text-fg",
			children: "Pausa"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 font-sans text-sm text-muted tabular-nums",
			children: [
				ui.score,
				" pontos · onda ",
				ui.wave
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: onResume,
					children: "Continuar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: onHow,
					children: "Como jogar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: onMute,
					children: ui.muted ? "Som desligado" : "Som ligado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: onShake,
					children: ui.shake ? "Tremor ligado" : "Tremor desligado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: onQuit,
					children: "Menu"
				})
			]
		})
	] });
}
function GameOver({ ui, onRetry, onMenu }) {
	const acc = ui.letters + ui.misses === 0 ? 0 : Math.round(ui.letters / (ui.letters + ui.misses) * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-sans text-xs uppercase tracking-[0.2em] text-muted",
			children: "Fim de jogo"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 font-display text-3xl text-fg",
			children: "Arquivo encerrado"
		}),
		ui.isNewRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-sans text-sm text-parchment",
			children: "Novo recorde"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 font-display text-4xl tabular-nums leading-none text-fg",
			children: ui.score
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-5 grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted",
					children: "Onda"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums text-fg",
					children: ui.wave
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted",
					children: "Naves"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums text-fg",
					children: ui.shipsDestroyed
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted",
					children: "Precisão"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
					className: "tabular-nums text-fg",
					children: [acc, "%"]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted",
					children: "Combo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums text-fg",
					children: ui.maxCombo
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				onClick: onRetry,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
					className: "size-4",
					strokeWidth: 1.75
				}), "Jogar de novo"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "ghost",
				onClick: onMenu,
				children: "Menu"
			})]
		})
	] });
}
function HowTo({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-fg",
				children: "Como jogar"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "flex size-11 items-center justify-center rounded-md text-muted",
				"aria-label": "Fechar",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 space-y-4",
			children: [
				{
					t: "Leia a nave",
					d: "Cada invasora carrega o nome de uma personalidade histórica."
				},
				{
					t: "Trave o alvo",
					d: "A primeira letra escolhe a nave mais ameaçadora com aquele início."
				},
				{
					t: "Complete o nome",
					d: "Cada letra dispara. Acentos são opcionais; espaços contam."
				},
				{
					t: "Não deixe descer",
					d: "Três vidas. Se a nave alcançar a sua, o arquivo perde uma."
				}
			].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-xs tabular-nums text-subtle",
					children: i + 1
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-sm font-medium text-fg",
					children: s.t
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 font-sans text-sm text-muted",
					children: s.d
				})] })]
			}, s.t))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: onClose,
				children: "Entendi"
			})
		})
	] });
}
function Scores({ ui, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-fg",
				children: "Recordes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "flex size-11 items-center justify-center rounded-md text-muted",
				"aria-label": "Fechar",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}),
		ui.scores.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 font-sans text-sm text-muted",
			children: "Nenhuma pontuação ainda. Jogue uma partida."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 space-y-2",
			children: ui.scores.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-xs tabular-nums text-subtle",
						children: i + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 font-sans text-sm tabular-nums text-fg",
						children: s.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-sans text-xs text-muted",
						children: ["onda ", s.wave]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-sans text-xs tabular-nums text-subtle",
						children: [s.ships, " naves"]
					})
				]
			}, `${s.at}-${s.score}`))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: onClose,
				children: "Fechar"
			})
		})
	] });
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "min-h-dvh bg-bg" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {})
	});
}
//#endregion
export { Home as component };
