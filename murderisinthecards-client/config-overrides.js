//const util = require('util');
const { getBabelLoader } = require('customize-cra');
const path = require('path');

module.exports = {
	webpack: function(config, _) {
		// cf. https://github.com/facebook/create-react-app/issues/6799
		const loader = getBabelLoader(config, false);
		const common = path.normalize(path.join(
			process.cwd(),
			'../murderisinthecards-common'
		));
		//console.log(common);
		loader.include = [loader.include, common];
		//console.log(util.inspect(config, {showHidden: false, depth: null}));
		return config;
	},
};
