export interface Sprites {
  player: HTMLImageElement | null;
  aliens: (HTMLImageElement | null)[];
  bg: HTMLImageElement | null;
}

function load(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function loadSprites(): Promise<Sprites> {
  const [player, scarab, saucer, dart, bg] = await Promise.all([
    load("/sprites/player.png"),
    load("/sprites/alien-scarab.png"),
    load("/sprites/alien-saucer.png"),
    load("/sprites/alien-dart.png"),
    load("/bg/starchart.jpg"),
  ]);
  return { player, aliens: [scarab, saucer, dart], bg };
}
