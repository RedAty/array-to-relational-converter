# **Array to Relational Converter**

We can create Relational Data ({ nodes, links }) for graphs from Array of Objects. ([ {}, {} ])

For Relation based graphs, like [Force Graph](https://github.com/d3/d3-force) or [Sankey](https://github.com/d3/d3-sankey) we need to have this kind of data structure.
Very useful for D3 js visualisations.

___

##Usage
You can find example usage in example.js too.
###Method name: createForceFromArray()

```javascript
const result = createForceFromArray(data, {
	paths:[
		{
			source:'sourceKey',
			target:'targetKey',
		},
		{
			source:'secondSourceKey',
			target:'secondTargetKey'
		}
	],
	circular:false,
	targetType:"id", //This can be 'id' or 'name' or 'reference'
	includedKeys:['extra'] //Keys connected to nodes
});

```
#Roadmap
___
Documentation is not detailed yet, because the project in under construction, but i will put more examples and explanation here and in my webpage.
