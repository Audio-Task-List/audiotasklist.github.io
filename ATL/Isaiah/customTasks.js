"use strict";

const routines = [
	{
		id:0,
		theme:{body:"#FFF", unstarted:"#777", current:"#093", completed:"#890"},
		name:"Morning",
		audio:"morning",
		loopAudio:true,
		loopDelay:10,
		taskAudioPrefix:'Isaiah',
		autoAdvanceDone:true,
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		tasks:[
			{id:20},
			{
				id:0,
				tasks:[
					{id:1},
					{id:2},
					{id:3},
					{id:22}
				]
			},
			{
				id:4,
				tasks:[
					{id:5},
					{id:6},
					{id:21},
					{id:7}
				]
			},
			{
				id:8,
				tasks:[
					{id:9},
					{id:10}
				]
			}
		]
	},
	{
		id:1,
		theme:"dark",
		name:"Afternoon",
		loopAudio:true,
		loopDelay:10,
		taskAudioPrefix:'Isaiah',
		autoAdvanceDone:true,
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		tasks:[
			{id:11},
			{id:12}
		]
	},
	{
		id:2,
		theme:"dark",
		name:"Evening",
		audio:"evening",
		loopAudio:true,
		loopDelay:10,
		autoAdvanceDone:true,
		taskAudioPrefix:'Isaiah',
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		tasks:[
			{id:3},
			{id:2},
			{
				id:13,
				tasks:[
					{id:14},
					{id:15},
					{id:16},
					{id:17},
					{id:5},
					{id:7}
				]
			},
			{id:18},
			{id:19}
		]
	}
];

const tasks = [
	{
		id:0,
		text:"Breakfast Time",
		time:2000,
		audio:"downstairs"
	},
	{
		id:1,
		text:"Eat Up!",
		time:900,
		audio:"breakfast"
	},
	{
		id:2,
		text:"Drink Up!",
		time:420,
		audio:"milk"
	},
	{
		id:3,
		text:"Medicine Time!",
		time:30,
		audio:"medicine"
	},
	{
		id:4,
		text:"Get ready for the Day!",
		time:600,
		audio:"ready"
	},
	{
		id:5,
		text:"Brush Your Teeth!",
		time:300,
		audio:"teeth"
	},
	{
		id:6,
		text:"Pajamas Off!",
		time:120,
		audio:"unpajamas"
	},
	{
		id:7,
		text:"Clothes in hamper!",
		time:60,
		audio:"hamper"
	},
	{
		id:8,
		text:"Get ready to GO!",
		time:500,
		audio:"readyToGo"
	},
	{
		id:9,
		text:"Potty Time",
		time:300,
		audio:"potty"
	},
	{
		id:10,
		text:"Shoes On!",
		time:180,
		audio:"shoes"
	},
	{
		id:11,
		text:"Eat a snack",
		time:600,
		audio:"snack"
	},
	{
		id:12,
		text:"Drink your water",
		time:300,
		audio:"water"
	},
	{
		id:13,
		text:"Clean Yourself",
		time:900,
		audio:"cleanliness"
	},
	{
		id:14,
		text:"Clothes Off!",
		time:120,
		audio:"undress"
	},
	{
		id:15,
		text:"Bath Time!",
		time:480,
		audio:"bathe"
	},
	{
		id:16,
		text:"Dry Yourself!",
		time:180,
		audio:"dry"
	},
	{
		id:17,
		text:"Pajamas On!",
		time:180,
		audio:"pjs"
	},
	{
		id:18,
		text:"Pick out clothes!",
		time:180,
		audio:"pick"
	},
	{
		id:19,
		text:"Bed Time",
		time:60,
		audio:"sleep"
	},
	{
		id:20,
		text:"Wake up",
		time:60,
		audio:"wake"
	},
	{
		id:21,
		text:"Clothes On",
		time:300,
		audio:"dress"
	},
	{
		id:22,
		text:"Make your bed",
		time:120,
		audio:"bed"
	}
];				