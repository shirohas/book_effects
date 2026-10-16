// A short filtered noise burst approximates the rustle of paper without assets.
export const createPageTurnSound = () => {
	let context: AudioContext | null = null;
	let buffer: AudioBuffer | null = null;
	let disposed = false;

	const prepare = () => {
		if (disposed || typeof AudioContext === "undefined") return;
		try {
			context ??= new AudioContext();
			if (context.state === "suspended") void context.resume().catch(() => {});
		} catch {
			// Audio availability must not prevent page navigation.
		}
	};

	const play = () => {
		prepare();
		if (context?.state !== "running" || disposed) return;
		if (!buffer) {
			buffer = context.createBuffer(
				1,
				Math.ceil(context.sampleRate * 0.24),
				context.sampleRate,
			);
			const samples = buffer.getChannelData(0);
			for (let i = 0; i < samples.length; i++) {
				const progress = i / samples.length;
				samples[i] =
					(Math.random() * 2 - 1) * Math.sin(Math.PI * progress) ** 2;
			}
		}

		const source = context.createBufferSource();
		const filter = context.createBiquadFilter();
		const gain = context.createGain();
		source.buffer = buffer;
		filter.type = "bandpass";
		filter.frequency.value = 1800;
		filter.Q.value = 0.7;
		gain.gain.value = 0.18;
		source.connect(filter).connect(gain).connect(context.destination);
		source.onended = () => {
			source.disconnect();
			filter.disconnect();
			gain.disconnect();
		};
		source.start();
	};

	return {
		prepare,
		play,
		dispose: () => {
			disposed = true;
			if (context) void context.close().catch(() => {});
			context = null;
			buffer = null;
		},
	};
};
