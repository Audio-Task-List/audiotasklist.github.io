"use strict";

const routines = [
	{
		id:0,
		name:"Morning",
		audio:"morning",
		audioAttribution:{
			url:"https://freetts.com/",
			creator:"freetts.com"
		},
		icon:"sun.png",
		iconAttribution:{
			url:"https://www.flaticon.com/free-icons/morning",
			creator:"Icon Place"
		},
		loopAudio:true,
		loopDelay:10,
		taskAudioPrefix:"Caleb",
		autoAdvanceDone:true,
		audioEncouragement:"awesome",
		timeExpiredAudio:"timer",
		reminderLimit:2,
		tasks:[
			{id:3},
			{id:1},
			{id:0},
			{id:2}
		]
	}
];

const tasks = [
	{
		id:0,
		text:"Eat up",
		time:1200,
		audio:"breakfast_milk",
		audioAttribution:{
			url:"https://freetts.com/",
			creator:"freetts.com"
		},
		icon:"oatmeal.png",
		iconAttribution:{
			url:"https://www.flaticon.com/free-icons/oatmeal",
			creator:"photo3idea_studio"
		}
	},
	{
		id:1,
		text:"Brush your teeth",
		time:300,
		audio:"teeth_potty",		
		audioAttribution:{
			url:"https://freetts.com/",
			creator:"freetts.com"
		},
		icon:"brush-teeth.png",
		iconAttribution:{
			url:"https://www.flaticon.com/free-icons/brush-teeth",
			creator:"iconixar"
		}
	},
	{
		id:2,
		text:"Get ready to GO",
		time:600,
		audio:"readyToGo",
		audioAttribution:{
			url:"https://freetts.com/",
			creator:"freetts.com"
		},
		icon:"shoes.png",
		iconAttribution:{
			url:"https://www.flaticon.com/free-icons/shoes",
			creator:"smashicons"
		}
	},
	{
		id:3,
		text:"Get Dressed",
		time:600,
		audio:"dress_potty",		
		audioAttribution:{
			url:"https://freetts.com/",
			creator:"freetts.com"
		},
		icon:"clothes.png",
		iconAttribution:{
			url:"https://www.flaticon.com/free-icons/clothes",
			creator:"Freepik"
		}
	}
];				