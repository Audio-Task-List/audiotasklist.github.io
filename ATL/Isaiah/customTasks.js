"use strict";

const routines = [
	{
		id:0,
		theme:"dark",
		name:"Morning",
		audio:"morning",
		loopAudio:true,
		loopDelay:10,
		autoAdvanceDone:true,
		taskAudioPrefix:'Isaiah',
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		tasks:[
			{id:20},
			{
				id:0,
				tasks:[
					{id:1},
					{id:2},
					{id:3}
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
		autoAdvanceDone:true,
		taskAudioPrefix:'Isaiah',
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
		audio:"downstairs",
		image:""
	},
	{
		id:1,
		text:"Eat Up!",
		time:900,
		audio:"breakfast",
		image:""
	},
	{
		id:2,
		text:"Drink Up!",
		time:420,
		audio:"milk",
		image:""
	},
	{
		id:3,
		text:"Medicine Time!",
		time:30,
		audio:"medicine",
		image:""
	},
	{
		id:4,
		text:"Get ready for the Day!",
		time:600,
		audio:"ready",
		image:""
	},
	{
		id:5,
		text:"Brush Your Teeth!",
		time:300,
		audio:"teeth",
		image:""
	},
	{
		id:6,
		text:"Pajamas Off!",
		time:120,
		audio:"unpajamas",
		image:""
	},
	{
		id:7,
		text:"Clothes in hamper!",
		time:60,
		audio:"hamper",
		image:""
	},
	{
		id:8,
		text:"Get ready to GO!",
		time:500,
		audio:"readyToGo",
		image:""
	},
	{
		id:9,
		text:"Potty Time",
		time:300,
		audio:"potty",
		image:""
	},
	{
		id:10,
		text:"Shoes On!",
		time:180,
		audio:"shoes",
		image:""
	},
	{
		id:11,
		text:"Eat a snack",
		time:600,
		audio:"snack",
		image:""
	},
	{
		id:12,
		text:"Drink your water",
		time:300,
		audio:"water",
		image:""
	},
	{
		id:13,
		text:"Clean Yourself",
		time:900,
		audio:"cleanliness",
		image:""
	},
	{
		id:14,
		text:"Clothes Off!",
		time:120,
		audio:"undress",
		image:""
	},
	{
		id:15,
		text:"Bath Time!",
		time:480,
		audio:"bathe",
		image:""
	},
	{
		id:16,
		text:"Dry Yourself!",
		time:180,
		audio:"dry",
		image:""
	},
	{
		id:17,
		text:"Pajamas On!",
		time:180,
		audio:"pjs",
		image:""
	},
	{
		id:18,
		text:"Pick out clothes!",
		time:180,
		audio:"pick",
		image:""
	},
	{
		id:19,
		text:"Bed Time",
		time:60,
		audio:"sleep",
		image:""
	},
	{
		id:20,
		text:"Wake up",
		time:60,
		audio:"wake",
		image:""
	},
	{
		id:21,
		text:"Clothes On",
		time:300,
		audio:"dress",
		image:""
	}
];				
