"use strict";

const routines = [
	{
		id:0,
		name:"Morning",
		audio:"morning",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'sun.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/morning',
			creator:'Icon Place'
		},
		loopAudio:true,
		loopDelay:10,
		autoAdvanceDone:true,
		taskAudioPrefix:'Isaiah',
		autoAdvanceDone:true,
		audioEncouragement:'awesome',
		timeExpiredAudio:'timer',
		reminderLimit:2,
		tasks:[
			{id:20},
			{id:9},
			{id:6},
			{id:21},			
			{id:7},
			{id:22},
			{id:9},
			{id:5},
			{id:0},
			{id:1},
			{id:2},
			{id:10},
			{id:26}
		]
	},
	{
		id:1,
		name:"Afternoon",
		icon:'afternoon.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/sunset',
			creator:'Freepik'
		},
		loopAudio:true,
		loopDelay:10,
		autoAdvanceDone:true,
		taskAudioPrefix:'Isaiah',
		autoAdvanceDone:true,
		audioEncouragement:'awesome',
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
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
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'evening.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/night',
			creator:'kmg design'
		},
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
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
		audio:"eatingTime",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:"dining-table.png",
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/dining-room',
			creator:'Freepik'
		},
	},
	{
		id:1,
		text:"Eat up",
		time:900,
		audio:"breakfast",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:"oatmeal.png",
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/oatmeal',
			creator:'photo3idea_studio'
		}
	},
	{
		id:2,
		text:"Drink up",
		time:420,
		audio:"milk",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:"milk.png",
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/milk',
			creator:'Smashicons'
		}
	},
	{
		id:3,
		text:"Medicine time",
		time:30,
		audio:"medicine",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:"medicine.png",
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/syringe',
			creator:'vitalia221'
		}
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
		audio:"teeth",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'brush-teeth.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/brush-teeth',
			creator:'iconixar'
		}
	},
	{
		id:6,
		text:"Pajamas off",
		time:180,
		audio:"unpajamas",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'pajamas.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/pajamas',
			creator:'iconixar'
		}
	},
	{
		id:7,
		text:"Clothes in hamper",
		time:60,
		audio:"hamper",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'hamper.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/hamper',
			creator:'Flowicon'
		}
	},
	{
		id:8,
		text:"Get ready to GO",
		time:500,
		audio:"readyToGo",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
	},
	{
		id:9,
		text:"Potty time",
		time:300,
		audio:"potty",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'toilet.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/toilet',
			creator:'Eucalyp'
		}
	},
	{
		id:10,
		text:"Shoes on",
		time:180,
		audio:"shoes",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'shoes.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/shoes',
			creator:'Smashicons'
		}
	},
	{
		id:11,
		text:"Eat a snack",
		time:600,
		audio:"snack",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'snack.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/crisps',
			title:'Snack icon attribution',
			creator:'Freepik'
		}
	},
	{
		id:12,
		text:"Drink your water",
		time:300,
		audio:"water",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'drink-water.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/drink',
			creator:'GOWI'
		}
	},
	{
		id:13,
		text:"Clean yourself",
		time:900,
		audio:"cleanliness",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		}
	},
	{
		id:14,
		text:"Clothes off",
		time:240,
		audio:"undress",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'nude.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/body',
			creator:'Freepik'
		}
	},
	{
		id:15,
		text:"Wash time",
		time:480,
		audio:"bathe",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'bath.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/bath',
			creator:'Eucalyp'
		}
	},
	{
		id:16,
		text:"Dry yourself",
		time:180,
		audio:"dry",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'towel.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/towel',
			creator:'Konkapp'
		}
	},
	{
		id:17,
		text:"Pajamas on",
		time:240,
		audio:"pjs",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'pajamas.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/pajamas',
			creator:'iconixar'
		}
	},
	{
		id:18,
		text:"Pick out clothes",
		time:180,
		audio:"pick",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'pick.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/clothes',
			creator:'Freepik'
		}
	},
	{
		id:19,
		text:"Bed time",
		time:60,
		audio:"sleep",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'sleep.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/sleep',
			creator:'Smashicons'
		}
	},
	{
		id:20,
		text:"Wake up",
		time:60,
		audio:"wake",
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
	},
	{
		id:21,
		text:"Clothes on",
		time:300,
		audio:"dress",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'clothes.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/clothes',
			creator:'Freepik'
		}
	},
	{
		id:22,
		text:"Make your bed",
		time:120,
		audio:"bed",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'bed.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/bed',
			creator:'Freepik'
		}
	},
	{
		id:23,
		text:"Go Upstairs",
		time:60,
		audio:"upstairs",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'upstairs.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/upstairs',
			creator:'kerismaker'
		}
	},
	{
		id:24,
		text:"Throw away insert",
		time:120,
		audio:"throwAwayInsert",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'insert.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/sanitary-pad',
			creator:'Freepik'
		}
	},
	{
		id:25,
		text:"Go Downstairs",
		time:60,
		audio:"downstairs",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'downstairs.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/downstairs',
			creator:'Freepik'
		}
	},
	{
		id:26,
		text:"Collect reward",
		time:30,
		audio:"collect",		
		audioAttribution:{
			url:'https://freetts.com/',
			creator:'freetts.com'
		},
		icon:'token.png',
		iconAttribution:{
			url:'https://www.flaticon.com/free-icons/tokens',
			creator:'Vitaly Gorbachev'
		}
	}
];				
