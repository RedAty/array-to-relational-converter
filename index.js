'use strict';

/**
 * @typedef {Object} forcePaths
 * @property {String} source
 * @property {String} target
 */

/**
 * @typedef {Object} forceLinks
 * @property {*} source
 * @property {*} target
 */
/**
 * @typedef {Object} forceData
 * @property {Array} nodes
 * @property {forceLinks[]} links
 */

/**
 *
 * @param {object[]} array
 * @param {object} config
 * @param {forcePaths} config.paths
 * @param {string[]} config.includedKeys
 * @param {boolean} config.circular
 * @param {'id'|'name'|'reference'} config.targetType
 */
const createForceFromArray = function (array, config) {

	const {
		paths,
		includedKeys,
		targetType,
		circular
	} = config;

	const prefix = 'r@nĐ0m-> ';

	/**
	 * @type {forceData}
	 */
	let forceData = {
		nodes:[],
		links:[]
	};

	/**
	 * Create Data Flow
	 *
	 * data flow contains the route of relations like obj1 -> obj2 -> obj3
	 */
	const dataFlow = [];

	paths.forEach((path,i) => {
		if (path && path.source && path.target) {
			const target = path.target;
			const source = path.source;
			if (!i) {
				dataFlow.push(source);
			}
			dataFlow.push(target);
		}
	});

	if (!circular) {
		array.forEach(object => {
			dataFlow.forEach((flowName, flowIndex) => {
				if(object && ( typeof object[flowName] === 'string' || typeof object[flowName] === 'number') ){
					object[flowName] = flowIndex + prefix + object[flowName]
				}
			})
		})
	}
	/**
	 * Checks object is undefined or null, but the Number 0 will true
	 * @param {Object} data
	 * @return {boolean}
	 */
	const isNothing = function (data) {
		return data === undefined || data === null;
	};

	/**
	 * This function shows where the keys of searchFor Object are included in array or not
	 * @param {object[]} array
	 * @param {object} searchFor
	 * @returns {number}
	 */
	const indexOf = (array, searchFor) => {
		let result = -1;
		array.forEach( (d, i) => {
			let everyKey = true;
			const keys = Object.keys(searchFor);
			keys.forEach(key => {
				const keyExists = !isNothing(d[key]);
				const searchValueExists = !isNothing(searchFor[key]);
				if(
					(
						keyExists && searchValueExists && //Patch: number 0 equals false
						d[key].toString() !== searchFor[key].toString()
					)
					|| !keyExists
					|| !searchValueExists
				){
					everyKey = false;
				}
			});
			if(everyKey){
				result = i;
			}
		});
		return result;
	};

	/**
	 * This function determines that the keys of searchFor Object are included in array or not
	 * @param {object[]} array
	 * @param {object} searchFor
	 * @return {boolean}
	 */
	const includes = function(array,searchFor){
		let result = false;
		array.forEach(function (d) {
			let everyKey = true;
			const keys = Object.keys(searchFor);
			keys.forEach(key => {
				const keyExists = !isNothing(d[key]);
				const searchValueExists = !isNothing(searchFor[key]);
				if(
					(
						keyExists && searchValueExists &&
						d[key].toString() !== searchFor[key].toString()
					)
					|| !keyExists
					|| !searchValueExists
				){
					everyKey = false;
				}
			});
			if(everyKey){
				result = everyKey;
			}
		});
		return result;
	};

	/**
	 * Update column types according to the Flow ID
	 * @param {number} index
	 */
	const refreshColumn = index => {
		forceData.nodes.forEach(object => {
			if (object._type === 'source') {
				object._type = index;
			}
			if (object._type === 'target') {
				object._type = 'source';
			}
		});
	};

	/**
	 * Converts input data to a string
	 * @param data
	 * @returns {string}
	 */
	const stringify = function(data){
		const type = typeof data;
		if(type !== 'string'){
			if(Array.isArray(data)){
				data = data.join();
			}else{
				try {
					data = data.toString();
				}catch ( e ) {
					data = 'undefined type';
				}
			}
		}
		return data;
	};

	/**
	 * Walks through every iterate of data-dataFlow
	 * @param {function} step
	 */
	const walk = step => {
		dataFlow.forEach((source, index) => {
			const target = dataFlow[index + 1];
			if (!target) {
				refreshColumn(index);
				return;
			}
			array.forEach(object => {
				step(object, {
					path:[source, target],
					flowIndex:index
				});
			});
			if (!circular) {
				refreshColumn(index);
			}
		});
	};

	/**
	 * Create Nodes
	 * @type {number}
	 */
	walk((data, config) => {
		const {
			path
		} = config;

		path.forEach((typeName,index) => {
			let node = {};

			const name = stringify(data[typeName]);
			const position = indexOf(forceData.nodes,{
				name:name
			});

			if(position === -1){

				node.name = name;
				node._type = index ? 'target' : 'source';

				/**
				 * Add extra keys for node
				 */
				if (Array.isArray(includedKeys)) {
					includedKeys.forEach(key => {
						if (key !== 'name' && key !== '_type') {
							if (!node[key]) {
								node[key] = [data[key]]
							} else {
								node[key].push(data[key])
							}
						}
					});
				}

				forceData.nodes.push(node);
			} else if(Array.isArray(includedKeys)) {

				/**
				 * Add extra keys for node
				 */
				const selectedNode = forceData.nodes[position];
				includedKeys.forEach(key => {
					if (key !== 'name' && key !== '_type') {
						if (!selectedNode[key]) {
							selectedNode[key] = [data[key]]
						} else if(!selectedNode[key].includes(data[key])) {
							selectedNode[key].push(data[key])
						}
					}
				});
			}
		});

		/**
		 * Create Links
		 * @type {number}
		 */
		const source = indexOf(forceData.nodes,{ name:data[path[0]] });
		const target = indexOf(forceData.nodes,{ name:data[path[1]] });
		const link = {
			source:source,
			target:target
		};

		if( source !== -1 && target !== -1 && !includes(forceData.links, link)) {
			forceData.links.push(link);
		}
	});

	/**
	 * Apply custom target Types
	 */
	if (targetType === 'name') {
		forceData.links.forEach(function (link) {
			link.source = forceData.nodes[link.source].name;
			link.target = forceData.nodes[link.target].name;
		});
	} else if (targetType === 'reference') {
		forceData.links.forEach(function (link) {
			link.source = forceData.nodes[link.source];
			link.target = forceData.nodes[link.target];
		});
	}

	if ( !circular ) {
		forceData.nodes.forEach(object => {
			const name = object.name;
			const parts = name.split(prefix);
			parts.shift();
			object.name = parts.join('');
		});
	}
	return forceData;
};

module.exports = {
	createForceFromArray
};
