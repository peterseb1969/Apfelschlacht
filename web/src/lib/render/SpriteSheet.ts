export interface SpriteSet {
	man: HTMLImageElement[];
	boy: HTMLImageElement[];
	apple: HTMLImageElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

export async function loadSprites(basePath: string): Promise<SpriteSet> {
	const manPromises = Array.from({ length: 8 }, (_, i) =>
		loadImage(`${basePath}/malePerson_walk${i}.png`)
	);
	const boyPromises = Array.from({ length: 8 }, (_, i) =>
		loadImage(`${basePath}/femalePerson_walk${i}.png`)
	);
	const applePromise = loadImage(`${basePath}/apple.png`);

	const [man, boy, apple] = await Promise.all([
		Promise.all(manPromises),
		Promise.all(boyPromises),
		applePromise
	]);

	return { man, boy, apple };
}
