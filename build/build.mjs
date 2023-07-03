import child_process from 'child_process';
import esbuild from 'esbuild';
import util from 'util';

const exec = util.promisify(child_process.exec);

let dev = false;
let clean = false;
let watch = false;

for (const arg of process.argv.slice(2)) {
	switch (arg) {
		case '--dev':
			dev = true;
			break;
		case '--clean':
			clean = true;
			break;
		case '--watch':
			watch = true;
			break;
		default:
			console.log('Unknown argument', arg);
			process.exit(1);
	}
}

if (clean) {
	await exec('rm -rf dist/')
	await exec('mkdir dist');
	await Promise.all([
		exec('mkdir dist/server'),
		exec('cp -r client/static dist/'),
	]);
}

const buildOptsBase = {
	bundle: true,
	target: 'es2020',
	minify: !dev,
	sourcemap: 'linked',
};

const ctxs = await Promise.all([
	esbuild.context({
		...buildOptsBase,
		entryPoints: ['server/index.ts'],
		outfile: 'dist/server/server.js',
		platform: 'node',
	}),
	esbuild.context({
		...buildOptsBase,
		entryPoints: ['client/index.tsx'],
		outfile: 'dist/static/client.js',
		platform: 'browser',
	}),
]);

if (watch) {
	await Promise.all(ctxs.map(ctx => ctx.watch()));
	await ctxs[1].serve({port: 3000, host: '127.0.0.1', servedir: './dist/static'});
	console.log('Listening on http://localhost:3000');
} else {
	await Promise.all(ctxs.map(ctx => ctx.rebuild()));
	await Promise.all(ctxs.map(ctx => ctx.dispose()));
}
