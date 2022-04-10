'use strict';

var routines = [
	{
		id:0,
		name:'Default',
		icon:'breakfast.png',
		audio:'default',
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
		theme:'Trains',
		name:'Loop Audio, Train Theme',
		loopAudio:true,
		loopDelay:10,
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
		theme:'dark',
		name:'Timer Auto-Advance',
		autoAdvanceTimer:true,
		tasks:[
			{id:24},
			{
				id:21,
				tasks:[
					{id:22},
					{id:23}
				]
			},
			{
				id:17,
				tasks:[
					{id:18},
					{id:19},
					{id:20}
				]
			},
			{
				id:14,
				tasks:[
					{id:15},
					{id:16}
				]
			},
		]
	},
	{
		id:3,
		theme:'dark',
		name:'Task Done Auto-Advance',
		autoAdvanceDone:true,
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
		theme:'dark',
		name:'Enforce Order',
		enforceChildrenOrder:true,
		tasks:[
			{id:25},
			{id:26},
			{id:27}
		]
	},
	{
		id:5,
		theme:'dark',
		name:'Hide Done',
		audio:'hideCompleted',
		icon:'breakfast.png',
		loopAudio:false,
		loopDelay:0,
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
	},
	{
		id:6,
		theme:'dark',
		name:'Task Audio Prefix',
		loopAudio:false,
		loopDelay:0,
		taskAudioPrefix:'prefix',
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
		id:7,
		theme:'dark',
		name:'Task Audio Suffix',
		loopAudio:false,
		loopDelay:0,
		taskAudioSuffix:'suffix',
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
		id:8,
		theme:'dark',
		name:'Task Done Audio',
		loopAudio:false,
		loopDelay:0,
		audioEncouragement:'awesome',
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
		id:9,
		theme:'dark',
		name:'Time Expired Audio',
		loopAudio:false,
		loopDelay:0,
		timeExpiredAudio:'timer',
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

var tasks = [
	{
		id:0,
		text:'Eat Breakfast',
		time:3,
		audio:'breakfast',
		icon:'breakfast.png'
	},
	{
		id:1,
		text:'Get Dressed',
		time:15,
		audio:'dressed'
	},
	{
		id:2,
		text:'Eat Oatmeal',
		time:3,
		audio:'eat',
		icon:'breakfast.png'
	},
	{
		id:3,
		text:'Underwear On',
		time:3,
		audio:'underwear'
	},
	{
		id:4,
		text:'Pants On',
		time:3,
		audio:'trousers'
	},
	{
		id:5,
		text:'Shirt On',
		time:3,
		audio:'shirt'
	},
	{
		id:6,
		text:'Long Sleeved Shirt On',
		time:3,
		audio:'longShirt'
	},
	{
		id:7,
		text:'Socks On',
		time:3,
		audio:'socks'
	},
	{
		id:8,
		text:'Drink Milk',
		time:3,
		audio:'milk'
	},
	{
		id:9,
		text:'Medicine',
		time:3,
		audio:'medicine'
	},
	{
		id:10,
		text:'Potty Try',
		time:3,
		audio:'potty'
	},
	{
		id:11,
		text:'Shoes On',
		time:3,
		audio:'shoes'
	},
	{
		id:12,
		text:'Eat',
		time:30,
		audio:'eat'
	},
	{
		id:13,
		text:'Put Dish in the sink',
		time:3,
		audio:'dishes'
	},
	{
		id:14,
		text:'Cardio',
		time:1800
	},
	{
		id:15,
		text:'Bike',
		time:900,
		audio:'bike'
	},
	{
		id:16,
		text:'Treadmill',
		time:900,
		audio:'treadmill'
	},
	{
		id:17,
		text:'Arms/Shoulders',
		time:250,
	},
	{
		id:18,
		text:'Hammer Curl',
		time:120,
		audio:'hammerCurl'
	},
	{
		id:19,
		text:'Pull Up',
		time:60,
		audio:'pullup'
	},
	{
		id:20,
		text:'Push up',
		time:60,
		audio:'pushup'
	},
	{
		id:21,
		text:'Abs',
		time:190,
	},
	{
		id:22,
		text:'Crunches',
		time:60,
		audio:'crunches'
	},
	{
		id:23,
		text:'Plank',
		time:120,
		audio:'plank'
	},
	{
		id:24,
		text:'Warm Up',
		time:60,
		audio:'warmup'
	},
	{
		id:25,
		text:'Homework',
		time:3600,
	},
	{
		id:26,
		text:'Chores',
		time:3600,
	},
	{
		id:27,
		text:'Games/TV',
		time:3600,
	}
	
	
	
	
	
	
];				