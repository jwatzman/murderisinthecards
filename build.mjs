import child_process from 'child_process';
import esbuild from 'esbuild';
import util from 'util';

const exec = util.promisify(child_process.exec);

await exec('rm -rf dist/')
await exec('mkdir dist');
await Promise.all([
	exec('mkdir dist/server'),
	exec('cp -r client/static dist/'),
]);

await Promise.all([
	esbuild.build({
		entryPoints: ['server/index.ts'],
		outfile: 'dist/server/server.js',
		bundle: true,
		external: ['default-gateway'],
		platform: 'node',
		target: 'es2020',
		minify: false,
		sourcemap: 'linked',
	}),
	esbuild.build({
		entryPoints: ['client/index.tsx'],
		outfile: 'dist/static/client.js',
		bundle: true,
		platform: 'browser',
		target: 'es2020',
		minify: false,
		sourcemap: 'linked',
	}),
]);
