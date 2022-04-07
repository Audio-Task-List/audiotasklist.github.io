"use strict";

const routines = [
	{
		id:0,
		theme:"dark",
		name:"Default",
		icon:"breakfast.png",
		audio:"default",
		loopAudio:false,
		loopDelay:0,
		autoAdvanceTimer:false,
		enforceChildrenOrder:false,
		hideCompletedTasks:false,
		tasks:[
			{
				id:0,
				tasks:[
					{
						id:2,
						tasks:[
							{id:12},
							{id:13}
						]
					},
					{id:8}
				]
			},
			{
				id:1,
				tasks:[
					{id:3},
					{id:4},
					{id:5},
					{id:6},
					{id:7}
				]
			},
			{id:10},
			{id:11}
		]
	},
	{
		id:1,
		theme:"dark",
		name:"Loop Audio",
		loopAudio:true,
		loopDelay:10,
		autoAdvanceTimer:false,
		enforceChildrenOrder:false,
		hideCompletedTasks:false,
		tasks:[
			{
				id:0,
				tasks:[
					{
						id:2,
						tasks:[
							{id:12},
							{id:13}
						]
					},
					{id:8}
				]
			},
			{
				id:1,
				tasks:[
					{id:3},
					{id:4},
					{id:5},
					{id:6},
					{id:7}
				]
			},
			{id:10},
			{id:11}
		]
	},
	{
		id:2,
		theme:"dark",
		name:"Auto-Advance",
		loopAudio:false,
		loopDelay:0,
		autoAdvanceTimer:true,
		enforceChildrenOrder:false,
		hideCompletedTasks:false,
		tasks:[
			{
				id:0,
				tasks:[
					{
						id:2,
						tasks:[
							{id:12},
							{id:13}
						]
					},
					{id:8}
				]
			},
			{
				id:1,
				tasks:[
					{id:3},
					{id:4},
					{id:5},
					{id:6},
					{id:7}
				]
			},
			{id:10},
			{id:11}
		]
	},
	{
		id:3,
		theme:"dark",
		name:"Enforce Order",
		loopAudio:false,
		loopDelay:0,
		autoAdvanceTimer:false,
		enforceChildrenOrder:true,
		hideCompletedTasks:false,
		tasks:[
			{
				id:0,
				tasks:[
					{
						id:2,
						tasks:[
							{id:12},
							{id:13}
						]
					},
					{id:8}
				]
			},
			{
				id:1,
				tasks:[
					{id:3},
					{id:4},
					{id:5},
					{id:6},
					{id:7}
				]
			},
			{id:10},
			{id:11}
		]
	},
	{
		id:4,
		theme:"dark",
		name:"Hide Completed",
		audio:"hideCompleted",
		icon:"breakfast.png",
		loopAudio:false,
		loopDelay:0,
		autoAdvanceTimer:false,
		enforceChildrenOrder:false,
		hideCompletedTasks:true,
		tasks:[
			{
				id:0,
				tasks:[
					{
						id:2,
						tasks:[
							{id:12},
							{id:13}
						]
					},
					{id:8}
				]
			},
			{
				id:1,
				tasks:[
					{id:3},
					{id:4},
					{id:5},
					{id:6},
					{id:7}
				]
			},
			{id:10},
			{id:11}
		]
	}	
];

const tasks = [
	{
		id:0,
		text:"Eat Breakfast",
		time:3,
		audio:"breakfast",
		icon:"breakfast.png"
	},
	{
		id:1,
		text:"Get Dressed",
		time:15,
		audio:"dressed",
		icon:""
	},
	{
		id:2,
		text:"Eat Oatmeal",
		time:3,
		audio:"eat",
		icon:"breakfast.png"
	},
	{
		id:3,
		text:"Underwear On",
		time:3,
		audio:"underwear",
		icon:""
	},
	{
		id:4,
		text:"Pants On",
		time:3,
		audio:"trousers",
		icon:""
	},
	{
		id:5,
		text:"Shirt On",
		time:3,
		audio:"shirt",
		icon:""
	},
	{
		id:6,
		text:"Long Sleeved Shirt On",
		time:3,
		audio:"longShirt",
		icon:""
	},
	{
		id:7,
		text:"Socks On",
		time:3,
		audio:"socks",
		icon:""
	},
	{
		id:8,
		text:"Drink Milk",
		time:3,
		audio:"milk",
		icon:""
	},
	{
		id:9,
		text:"Medicine",
		time:3,
		audio:"medicine",
		icon:""
	},
	{
		id:10,
		text:"Potty Try",
		time:3,
		audio:"potty",
		icon:""
	},
	{
		id:11,
		text:"Shoes On",
		time:3,
		audio:"shoes",
		icon:""
	},
	{
		id:12,
		text:"Eat",
		time:30,
		audio:"eat",
		icon:""
	},
	{
		id:13,
		text:"Put Dish in the sink",
		time:3,
		audio:"dishes",
		icon:""
	}
	
];				