"use strict";

const routines = [
	{
		id:0,
		name:"Morning",
		audio:"morning",
		loopAudio:true,
		loopDelay:10,
		taskAudioPrefix:'Isaiah',
		autoAdvanceDone:true,
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		reminderLimit:2,
		tasks:[
			{id:0},
			{id:1},
			{id:2},
			{id:3},			
			{id:23},
			{id:22},
			{id:5},
			{id:6},
			{id:21},
			{id:24},
			{id:7},
			{id:9},
			{id:25},
			{id:10},
			{id:26}
		]
	},
	{
		id:1,
		name:"Afternoon",
		loopAudio:true,
		loopDelay:10,
		taskAudioPrefix:'Isaiah',
		autoAdvanceDone:true,
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		reminderLimit:2,
		tasks:[
			{id:11},
			{id:12}
		]
	},
	{
		id:2,
		name:"Evening",
		audio:"evening",
		loopAudio:true,
		loopDelay:10,
		autoAdvanceDone:true,
		taskAudioPrefix:'Isaiah',
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		reminderLimit:2,
		tasks:[
			{id:3},
			{id:2},
			{id:23},
			{id:14},
			{id:15},
			{id:16},
			{id:17},
			{id:5},
			{id:7},
			{id:18},
			{id:19},
			{id:26}
		]
	}
];

const tasks = [
	{
		id:0,
		text:"Travel time",
		time:120,
		audio:"eatingTime"
	},
	{
		id:1,
		text:"Eat up",
		time:900,
		audio:"breakfast"
	},
	{
		id:2,
		text:"Drink up",
		time:420,
		audio:"milk"
	},
	{
		id:3,
		text:"Medicine time",
		time:30,
		audio:"medicine"
	},
	{
		id:4,
		text:"Get ready for the day",
		time:600,
		audio:"ready"
	},
	{
		id:5,
		text:"Brush your teeth",
		time:180,
		audio:"teeth"
	},
	{
		id:6,
		text:"Pajamas off",
		time:180,
		audio:"unpajamas"
	},
	{
		id:7,
		text:"Clothes in hamper",
		time:60,
		audio:"hamper"
	},
	{
		id:8,
		text:"Get ready to GO",
		time:500,
		audio:"readyToGo"
	},
	{
		id:9,
		text:"Potty time",
		time:300,
		audio:"potty"
	},
	{
		id:10,
		text:"Shoes on",
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
		text:"Clean yourself",
		time:900,
		audio:"cleanliness"
	},
	{
		id:14,
		text:"Clothes off",
		time:240,
		audio:"undress"
	},
	{
		id:15,
		text:"Wash time",
		time:480,
		audio:"bathe"
	},
	{
		id:16,
		text:"Dry yourself",
		time:180,
		audio:"dry"
	},
	{
		id:17,
		text:"Pajamas on",
		time:240,
		audio:"pjs"
	},
	{
		id:18,
		text:"Pick out clothes",
		time:180,
		audio:"pick"
	},
	{
		id:19,
		text:"Bed time",
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
		text:"Clothes on",
		time:300,
		audio:"dress"
	},
	{
		id:22,
		text:"Make your bed",
		time:120,
		audio:"bed"
	},
	{
		id:23,
		text:"Travel time",
		time:60,
		audio:"upstairs"
	},
	{
		id:24,
		text:"Throw away insert",
		time:120,
		audio:"throwAwayInsert"
	},
	{
		id:25,
		text:"Travel time",
		time:60,
		audio:"downstairs"
	},
	{
		id:26,
		text:"Collect reward",
		time:30,
		audio:"collect"
	}
];				