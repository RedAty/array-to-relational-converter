const { createForceFromArray } = require("./index");
const {data} = require('./sourceData');

const result = createForceFromArray(data, {
	paths:[
		{
			source:'q',
			target:'w',
		},
		{
			source:'w',
			target:'e'
		}
	],
	circular:true,
	targetType:"id",
	includedKeys:['extra']
});

console.log(result);
